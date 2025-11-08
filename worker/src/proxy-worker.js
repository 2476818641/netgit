// worker/src/proxy-worker.js

import { handleRequest as getProxyTarget } from '../../shared/proxy-logic.js';

export default {
    async fetch(request, env, ctx) {
        // 新增：检查请求头，判断是否为WebSocket升级请求
        const upgradeHeader = request.headers.get('Upgrade');
        if (upgradeHeader && upgradeHeader.toLowerCase() === 'websocket') {
            console.log('Detected WebSocket upgrade request. Handling with WebSocket proxy.');
            // 如果是，则交由专门的WebSocket处理函数
            return handleWebSocketProxy(request);
        }

        // 如果不是WebSocket请求，则走原来的HTTP代理逻辑
        return handleHttpProxy(request, env, ctx);
    }
};

/**
 * 处理标准的HTTP/HTTPS代理请求
 */
async function handleHttpProxy(request, env, ctx) {
    const cache = caches.default;
    const result = await getProxyTarget(request);

    switch (result.status) {
        case 'proxy': {
            const targetUrlStr = result.targetUrl;
            
            // 使用原始请求作为缓存的key，这样更准确
            let response = await cache.match(request);
            if (response) {
                console.log(`Cache HIT for HTTP request: ${request.url}`);
                // 创建一个新的Response来添加自定义头，表示来自缓存
                const newHeaders = new Headers(response.headers);
                newHeaders.set('X-Proxy-Cache', 'HIT');
                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: newHeaders
                });
            }
            console.log(`Cache MISS for HTTP request: ${request.url}`);

            const targetUrl = new URL(targetUrlStr);
            
            // 创建新的请求头，并显式设置Host头，这对于'host'模式至关重要
            const newHeaders = new Headers(request.headers);
            newHeaders.set('Host', targetUrl.hostname);
            
            const newRequest = new Request(targetUrl.toString(), {
                headers: newHeaders,
                method: request.method,
                body: request.body,
                redirect: 'follow'
            });

            response = await fetch(newRequest);

            // 克隆响应，以便我们可以修改头信息
            response = new Response(response.body, response);
            response.headers.set('X-Proxy-By', 'NetGit-Worker');

            // 如果请求成功且为 GET 方法，则将其存入缓存
            if (request.method === 'GET' && response.ok) {
                // waitUntil确保缓存操作不阻塞对用户的响应
                ctx.waitUntil(cache.put(request, response.clone()));
            }
            
            return response;
        }

        case 'error': {
            return new Response(result.message, { status: result.statusCode });
        }

        case 'not_found':
        default: {
            // 在 Cloudflare Pages + Functions 混合模式下，这会由 Pages 平台自动处理
            try {
                return await env.ASSETS.fetch(request);
            } catch (e) {
                 return new Response("Not Found: No matching proxy rule and no static asset found.", { status: 404 });
            }
        }
    }
}

/**
 * 专门处理WebSocket代理请求
 */
async function handleWebSocketProxy(request) {
    // 同样，先获取代理目标
    const result = await getProxyTarget(request);

    if (result.status !== 'proxy') {
        return new Response("WebSocket proxy target not found.", { status: 404 });
    }

    const targetUrl = new URL(result.targetUrl);
    
    // 创建新的请求头，并确保Host头正确指向目标服务器
    const newHeaders = new Headers(request.headers);
    newHeaders.set('Host', targetUrl.hostname);

    // 关键：当Cloudflare Worker的fetch接收到带有'Upgrade: websocket'头的请求时，
    // 它会自动处理WebSocket的握手和代理。我们只需将请求转发即可。
    // Cloudflare运行时会自动在客户端和目标服务器之间建立一个直接的socket连接。
    return fetch(targetUrl.toString(), {
        headers: newHeaders,
        method: request.method,
        body: request.body,
        redirect: 'follow'
    });
}

// worker/src/proxy-worker.js

import { handleRequest as getProxyTarget } from '../../shared/proxy-logic.js';

export default {
    async fetch(request, env, ctx) {
        const upgradeHeader = request.headers.get('Upgrade');
        if (upgradeHeader && upgradeHeader.toLowerCase() === 'websocket') {
            console.log('Detected WebSocket upgrade request. Handling with WebSocket proxy.');
            return handleWebSocketProxy(request);
        }

        return handleHttpProxy(request, env, ctx);
    }
};

async function handleHttpProxy(request, env, ctx) {
    const cache = caches.default;
    const result = await getProxyTarget(request);

    switch (result.status) {
        case 'proxy': {
            const targetUrlStr = result.targetUrl;
            
            // 缓存检查逻辑保持不变
            let cachedResponse = await cache.match(request);
            if (cachedResponse) {
                console.log(`Cache HIT for HTTP request: ${request.url}`);
                const newHeaders = new Headers(cachedResponse.headers);
                newHeaders.set('X-Proxy-Cache', 'HIT');
                return new Response(cachedResponse.body, {
                    status: cachedResponse.status,
                    statusText: cachedResponse.statusText,
                    headers: newHeaders
                });
            }
            console.log(`Cache MISS for HTTP request: ${request.url}`);

            const targetUrl = new URL(targetUrlStr);
            
            const newHeaders = new Headers(request.headers);
            newHeaders.set('Host', targetUrl.hostname);
            
            const newRequest = new Request(targetUrl.toString(), {
                headers: newHeaders,
                method: request.method,
                body: request.body,
                redirect: 'follow'
            });
            
            // ==================== 核心修改部分开始 ====================

            // 1. 获取来自源站的响应
            const originResponse = await fetch(newRequest);

            // 2. 创建一个新的响应以便修改标头，同时保持流式传输
            const responseToClient = new Response(originResponse.body, originResponse);
            responseToClient.headers.set('X-Proxy-By', 'NetGit-Worker');

            // 3. [关键] 添加条件缓存逻辑，解决大文件下载问题
            if (request.method === 'GET' && originResponse.ok) {
                const contentType = originResponse.headers.get('Content-Type') || '';
                
                // 定义不应被缓存的内容类型（通常是大文件或二进制流）
                const nonCacheableTypes = [
                    'application/zip',
                    'application/octet-stream',
                    'application/x-zip-compressed',
                    'application/gzip',
                    'video/',
                    'audio/'
                ];
                
                // 检查响应的 Content-Type 是否属于不应缓存的类型
                const shouldCache = !nonCacheableTypes.some(type => contentType.startsWith(type));
                
                if (shouldCache) {
                    console.log(`Caching response for URL: ${request.url} (Content-Type: ${contentType})`);
                    // 使用 ctx.waitUntil 确保缓存操作在后台完成，不阻塞对客户端的响应
                    ctx.waitUntil(cache.put(request, responseToClient.clone()));
                } else {
                    console.log(`Skipping cache for non-cacheable type: ${contentType}`);
                }
            }
            
            // 4. 将响应直接、实时地流式返回给客户端
            return responseToClient;

            // ==================== 核心修改部分结束 ====================
        }

        case 'error': {
            return new Response(result.message, { status: result.statusCode });
        }

        case 'not_found':
        default: {
            try {
                // 如果是 Cloudflare Pages 部署，这里会尝试查找静态资源
                return await env.ASSETS.fetch(request);
            } catch (e) {
                 return new Response("Not Found: No matching proxy rule and no static asset found.", { status: 404 });
            }
        }
    }
}

async function handleWebSocketProxy(request) {
    const result = await getProxyTarget(request);

    if (result.status !== 'proxy') {
        return new Response("WebSocket proxy target not found.", { status: 404 });
    }

    const targetUrl = new URL(result.targetUrl);
    
    const newHeaders = new Headers(request.headers);
    newHeaders.set('Host', targetUrl.hostname);
    
    //  伪造Origin头，使其与目标服务器的Host匹配，以绕过一些安全检查
    newHeaders.set('Origin', `${targetUrl.protocol}//${targetUrl.hostname}`);
    
    // Cloudflare Worker 会自动处理 WebSocket 的握手和数据转发
    return fetch(targetUrl.toString(), {
        headers: newHeaders,
        method: request.method,
        body: request.body,
        redirect: 'follow'
    });
}

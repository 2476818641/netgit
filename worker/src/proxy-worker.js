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
            
            let response = await cache.match(request);
            if (response) {
                console.log(`Cache HIT for HTTP request: ${request.url}`);
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
            
            const newHeaders = new Headers(request.headers);
            newHeaders.set('Host', targetUrl.hostname);
            
            const newRequest = new Request(targetUrl.toString(), {
                headers: newHeaders,
                method: request.method,
                body: request.body,
                redirect: 'follow'
            });

            response = await fetch(newRequest);
            response = new Response(response.body, response);
            response.headers.set('X-Proxy-By', 'NetGit-Worker');

            if (request.method === 'GET' && response.ok) {
                ctx.waitUntil(cache.put(request, response.clone()));
            }
            
            return response;
        }

        case 'error': {
            return new Response(result.message, { status: result.statusCode });
        }

        case 'not_found':
        default: {
            try {
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
    
    // =======================================================================
    //  ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼  新增的关键代码  ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
    //
    //  伪造Origin头，使其与目标服务器的Host匹配，以绕过安全检查。
    //  目标URL的协议（http/https）加上主机名，构成了新的Origin。
    newHeaders.set('Origin', `${targetUrl.protocol}//${targetUrl.hostname}`);
    //
    //  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲  新增的关键代码  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
    // =======================================================================

    return fetch(targetUrl.toString(), {
        headers: newHeaders,
        method: request.method,
        body: request.body,
        redirect: 'follow'
    });
}

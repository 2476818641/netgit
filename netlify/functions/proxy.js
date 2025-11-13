// netlify/functions/proxy.js

import { handleRequest as getProxyTarget } from '../../shared/proxy-logic.js';

// Netlify Functions v2 API，支持流式响应
export default async (request, context) => {
    // 检查是否为 WebSocket 升级请求
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader && upgradeHeader.toLowerCase() === 'websocket') {
        console.log('Netlify: Detected WebSocket upgrade request.');
        // WebSocket 无法流式处理，走原始逻辑但返回标准 Response
        return handleWebSocketProxy(request);
    }

    // 处理标准的HTTP/HTTPS代理请求
    return handleHttpProxy(request);
};

/**
 * 处理标准的HTTP/HTTPS代理请求 (优化版)
 */
async function handleHttpProxy(request) {
    const result = await getProxyTarget(request);

    switch (result.status) {
        case 'proxy': {
            try {
                const targetUrl = new URL(result.targetUrl);
                
                // 创建新的请求头，并设置正确的 Host
                const newHeaders = new Headers(request.headers);
                newHeaders.set('Host', targetUrl.hostname);
                
                const newRequest = new Request(targetUrl.toString(), {
                    headers: newHeaders,
                    method: request.method,
                    body: request.body,
                    redirect: 'follow'
                });

                // ==================== 核心优化部分开始 ====================
                
                // 1. 发起 fetch 请求，获取原始响应
                const originResponse = await fetch(newRequest);

                // 2. 创建一个新的 Headers 对象，以便我们可以安全地修改它
                const responseHeaders = new Headers(originResponse.headers);

                // 3. 添加自定义头和缓存头
                responseHeaders.set('X-Proxy-By', 'Netlify-Function-Optimized');
                responseHeaders.set('Cache-Control', 'public, s-maxage=3600, max-age=3600'); // 缓存1小时
                
                // 4. 返回一个新的 Response 对象
                //    - 关键点：直接使用 originResponse.body (这是一个 ReadableStream)
                //    - 这就实现了完美的流式传输，数据从源服务器直接流向客户端
                return new Response(originResponse.body, {
                    status: originResponse.status,
                    statusText: originResponse.statusText,
                    headers: responseHeaders
                });
                
                // ==================== 核心优化部分结束 ====================

            } catch (e) {
                // 处理 fetch 过程中的错误
                return new Response(`Error fetching target: ${e.message}`, { status: 502 });
            }
        }

        case 'error': {
            return new Response(result.message, { status: result.statusCode });
        }
        
        case 'not_found':
        default: {
            return new Response("Not Found: No matching proxy rule found.", { status: 404 });
        }
    }
}

/**
 * 专门处理WebSocket代理请求 (保持不变，因为 WebSocket 本身就是流)
 */
async function handleWebSocketProxy(request) {
    const result = await getProxyTarget(request);

    if (result.status !== 'proxy') {
        return new Response("WebSocket proxy target not found.", { status: 404 });
    }

    const targetUrl = new URL(result.targetUrl);
    
    const newHeaders = new Headers(request.headers);
    newHeaders.set('Host', targetUrl.hostname);
    newHeaders.set('Origin', `${targetUrl.protocol}//${targetUrl.hostname}`);

    // 直接使用 fetch 转发，底层会自动处理握手
    return fetch(targetUrl.toString(), {
        headers: newHeaders,
        method: request.method,
        body: request.body,
        redirect: 'follow'
    });
}

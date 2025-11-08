// netlify/functions/proxy.js

// 引入我们的共享代理逻辑
import { handleRequest as getProxyTarget } from '../../shared/proxy-logic.js';

// Netlify 的主处理函数
export const handler = async (event, context) => {
    // 1. 将 Netlify 的 'event' 对象转换为标准的 Request 对象
    //    这样我们就可以在不同平台复用相同的逻辑
    const request = convertToRequest(event);

    // 2. 检查是否为 WebSocket 升级请求
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader && upgradeHeader.toLowerCase() === 'websocket') {
        console.log('Netlify: Detected WebSocket upgrade request.');
        // 如果是，则交由专门的 WebSocket 处理函数
        const response = await handleWebSocketProxy(request);
        // 将标准的 Response 对象转换回 Netlify 需要的格式
        return convertToNetlifyResponse(response);
    }

    // 3. 如果不是 WebSocket，则走标准的 HTTP 代理逻辑
    const response = await handleHttpProxy(request);
    return convertToNetlifyResponse(response);
};

/**
 * 处理标准的HTTP/HTTPS代理请求
 */
async function handleHttpProxy(request) {
    const result = await getProxyTarget(request);

    switch (result.status) {
        case 'proxy': {
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

            const response = await fetch(newRequest);
            // 克隆响应以修改头
            const newResponse = new Response(response.body, response);
            newResponse.headers.set('X-Proxy-By', 'Netlify-Function');
            return newResponse;
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
 * 专门处理WebSocket代理请求 (逻辑与Cloudflare版本完全相同)
 */
async function handleWebSocketProxy(request) {
    const result = await getProxyTarget(request);

    if (result.status !== 'proxy') {
        return new Response("WebSocket proxy target not found.", { status: 404 });
    }

    const targetUrl = new URL(result.targetUrl);
    
    const newHeaders = new Headers(request.headers);
    // 关键点1: 设置正确的 Host 头
    newHeaders.set('Host', targetUrl.hostname);
    // 关键点2: 伪造 Origin 头以通过应用层安全检查
    newHeaders.set('Origin', `${targetUrl.protocol}//${targetUrl.hostname}`);

    // 直接使用 fetch 转发，Netlify 的底层 Deno/Node.js 环境会处理 WebSocket 握手
    return fetch(targetUrl.toString(), {
        headers: newHeaders,
        method: request.method,
        body: request.body,
        redirect: 'follow'
    });
}


// =========== 辅助函数 ===========

/**
 * 将 Netlify 的 event 对象转换为标准的 Request 对象
 */
function convertToRequest(event) {
    const url = new URL(event.rawUrl);
    const headers = new Headers(event.headers);

    // 对于需要 body 的请求
    const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;
    
    return new Request(url, {
        method: event.httpMethod,
        headers: headers,
        body: (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD') ? body : undefined,
    });
}

/**
 * 将标准的 Response 对象转换为 Netlify handler 需要返回的格式
 */
async function convertToNetlifyResponse(response) {
    const headers = {};
    response.headers.forEach((value, key) => {
        headers[key] = value;
    });

    // Netlify Functions 对 body 有特殊处理要求
    // 对于二进制数据等需要 Base64 编码
    const bodyBuffer = await response.arrayBuffer();
    const body = Buffer.from(bodyBuffer).toString('base64');

    return {
        statusCode: response.status,
        headers: headers,
        body: body,
        isBase64Encoded: true, // 始终标记为 true，让 Netlify 处理解码
    };
}

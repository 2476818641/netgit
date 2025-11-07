// netlify/functions/proxy.js

import { handleRequest } from '../../shared/proxy-logic.js';

export default async (req) => {
    // Netlify 将原始 Node 请求对象转换为标准的 Request 对象
    const request = new Request(req);
    const result = await handleRequest(request);

    switch (result.status) {
        case 'proxy': {
            const newRequest = new Request(result.targetUrl, {
                headers: request.headers,
                method: request.method,
                body: request.body,
                redirect: 'follow'
            });
            // 直接返回 fetch 的结果，Netlify 会自动处理
            return fetch(newRequest);
        }

        case 'error': {
            return new Response(result.message, { status: result.statusCode });
        }

        case 'not_found':
        default: {
            // 在 Netlify Functions 中，如果没有匹配，直接返回 404
            return new Response('Not Found: No matching proxy rule.', { status: 404 });
        }
    }
};

export const config = {
    path: "/*"
};

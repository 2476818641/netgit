// worker/src/proxy-worker.js

import { handleRequest } from '../../shared/proxy-logic.js';

export default {
    async fetch(request, env, ctx) {
        // 获取缓存 API
        const cache = caches.default;

        // 处理请求的核心逻辑
        const result = await handleRequest(request);

        switch (result.status) {
            case 'proxy': {
                const targetUrl = result.targetUrl;
                
                // 尝试从缓存中获取响应
                let response = await cache.match(targetUrl);
                if (response) {
                    console.log(`Cache HIT for: ${targetUrl}`);
                    return response;
                }
                console.log(`Cache MISS for: ${targetUrl}`);

                // 如果缓存未命中，则发起新的请求
                const newRequest = new Request(targetUrl, {
                    headers: request.headers,
                    method: request.method,
                    body: request.body,
                    redirect: 'follow'
                });

                response = await fetch(newRequest);

                // 如果请求成功且为 GET 方法，则将其存入缓存
                if (request.method === 'GET' && response.ok) {
                    const cacheableResponse = response.clone();
                    // 使用 waitUntil 确保缓存操作不会阻塞对用户的响应
                    ctx.waitUntil(cache.put(targetUrl, cacheableResponse));
                }
                
                return response;
            }

            case 'error': {
                // 返回逻辑中定义的错误信息
                return new Response(result.message, { status: result.statusCode });
            }

            case 'not_found':
            default: {
                // 没有匹配任何代理规则，则尝试提供 Cloudflare Pages 的静态资源 (主页)
                // 在 Cloudflare Pages + Functions 混合模式下，这会由 Pages 平台自动处理
                // 如果是纯 Worker 部署，你需要配置 ASSETS 绑定
                try {
                    return await env.ASSETS.fetch(request);
                } catch (e) {
                     return new Response("Not Found: No matching proxy rule and no static asset found.", { status: 404 });
                }
            }
        }
    }
};

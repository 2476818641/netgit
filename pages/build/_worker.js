// worker/src/proxy-worker.js

import { proxyWithCache } from '../../shared/proxy-handler.js';
import { proxyRules } from '../../shared/config.js';
import { checkAllTargets, saveHealthCheckToKV } from '../../shared/health-checker.js';

export default {
    async fetch(request, env, ctx) {
        const cache = caches.default;
        const url = new URL(request.url);

        const isProxyPath = Object.keys(proxyRules).some(prefix => url.pathname.startsWith(prefix));
        if (url.pathname === '/' || !isProxyPath) {
            try {
                return await env.ASSETS.fetch(request);
            } catch (e) {
                return new Response("Not Found: No matching proxy rule and no static asset found.", { status: 404 });
            }
        }

        // 传递 KV 给代理处理器
        const result = await proxyWithCache(request, null, env.KV);

        if (result.ok && request.method === 'GET') {
            const targetUrl = result.headers.get('X-Target-Url') || url.href;

            try {
                const cachedResponse = await cache.match(targetUrl);
                if (cachedResponse) {
                    console.log(`Cloudflare Cache HIT for: ${targetUrl}`);
                    return new Response(cachedResponse.body, {
                        ...cachedResponse,
                        headers: new Headers([
                            ...cachedResponse.headers.entries(),
                            ['X-Cache-Status', 'HIT']
                        ])
                    });
                }

                console.log(`Cloudflare Cache MISS for: ${targetUrl}`);

                const cacheableResponse = result.clone();
                ctx.waitUntil(cache.put(targetUrl, cacheableResponse));
            } catch (e) {
                console.error('Cloudflare cache operation failed:', e);
            }
        }

        return result;
    },

    // 定时触发器：每30分钟执行一次健康检查
    async scheduled(event, env, ctx) {
        console.log('Running scheduled health check at:', new Date(event.scheduledTime).toISOString());

        try {
            // 执行健康检查
            const checkResults = await checkAllTargets();

            // 保存到 KV
            if (env.KV) {
                const recordKey = await saveHealthCheckToKV(env.KV, checkResults);
                console.log('Health check saved to KV:', recordKey);
            } else {
                console.warn('KV namespace not available, skipping save');
            }

            console.log('Health check completed:', {
                healthy: checkResults.summary.healthy,
                degraded: checkResults.summary.degraded,
                unhealthy: checkResults.summary.unhealthy
            });
        } catch (error) {
            console.error('Scheduled health check failed:', error);
        }
    }
};

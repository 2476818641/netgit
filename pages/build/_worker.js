// worker/src/proxy-worker.js

import { proxyWithCache } from '../../shared/proxy-handler.js';
import { proxyRules } from '../../shared/config.js';

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

        const result = await proxyWithCache(request, null);

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
    }
};

// netlify/functions/proxy.js

import { proxyRules } from '../../shared/config.js';

export default async (req) => {
    const url = new URL(req.url);
    const path = url.pathname;

    for (const prefix in proxyRules) {
        if (path.startsWith(prefix)) {
            const rule = proxyRules[prefix];
            let targetUrlStr;

            if (rule.type === 'path') {
                const subpath = path.substring(prefix.length);
                targetUrlStr = `${rule.target}/${subpath}${url.search}`;
            } else if (rule.type === 'url') {
                targetUrlStr = path.substring(prefix.length);
                 if (url.search) {
                        targetUrlStr += url.search;
                    }
                try {
                    let targetDomain = new URL(targetUrlStr).hostname;
                    if (!rule.allowedDomains.some(domain => targetDomain === domain || targetDomain.endsWith('.' + domain))) {
                        return new Response('Forbidden: Domain not allowed.', { status: 403 });
                    }
                } catch (e) {
                    return new Response('Bad Request: Invalid target URL.', { status: 400 });
                }
            }

            if (targetUrlStr) {
                // Netlify Functions 中，req.headers 是一个对象，而不是 Headers 实例
                // 需要直接传递给 fetch
                const newRequest = new Request(targetUrlStr, {
                    headers: req.headers,
                    method: req.method,
                    // Netlify req.body 是字符串或 null
                    body: req.body,
                    redirect: 'follow'
                });
                // 直接返回 fetch 的结果，Netlify 会自动处理 ReadableStream
                return fetch(newRequest);
            }
        }
    }

    // 如果没有匹配到任何规则，返回 404
    return new Response('Not Found: No matching proxy rule.', { status: 404 });
};

// 确保函数能处理所有路径
export const config = {
    path: "/*"
};

// worker/src/proxy-worker.js

import { proxyRules } from '../../shared/config.js';

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        // 遍历所有代理规则
        for (const prefix in proxyRules) {
            if (path.startsWith(prefix)) {
                const rule = proxyRules[prefix];
                let targetUrlStr;

                // 根据规则类型构建目标 URL
                if (rule.type === 'path') {
                    // 路径映射模式
                    const subpath = path.substring(prefix.length);
                    targetUrlStr = `${rule.target}/${subpath}${url.search}`;
                } else if (rule.type === 'url') {
                    // URL 参数模式
                    targetUrlStr = path.substring(prefix.length);
                    if (url.search) {
                        targetUrlStr += url.search;
                    }

                    // 安全检查：验证域名是否在白名单内
                    try {
                        let targetDomain = new URL(targetUrlStr).hostname;
                        if (!rule.allowedDomains.some(domain => targetDomain === domain || targetDomain.endsWith('.' + domain))) {
                            return new Response('Forbidden: Domain not allowed for this proxy.', { status: 403 });
                        }
                    } catch (e) {
                        return new Response('Bad Request: Invalid target URL.', { status: 400 });
                    }
                }

                if (targetUrlStr) {
                    // 创建新的请求转发到目标地址
                    // 关键：复制原始请求的 headers, method, body，这对 Docker 认证至关重要
                    const newRequest = new Request(targetUrlStr, {
                        headers: request.headers,
                        method: request.method,
                        body: request.body,
                        redirect: 'follow'
                    });

                    // 发起请求并直接返回响应
                    return fetch(newRequest);
                }
            }
        }

        // 如果没有匹配任何规则，则尝试提供静态资源 (主页)
        return env.ASSETS.fetch(request);
    }
};

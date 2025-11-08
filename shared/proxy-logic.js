// shared/proxy-logic.js

import { proxyRules } from './config.js';

/**
 * 处理代理请求的核心逻辑
 * @param {Request} request - 原始请求对象
 * @returns {Promise<object>} - 返回一个包含处理结果的对象
 */
export async function handleRequest(request) {
    const url = new URL(request.url);
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
                        return { 
                            status: 'error', 
                            message: 'Forbidden: Domain not allowed for this proxy.', 
                            statusCode: 403 
                        };
                    }
                } catch (e) {
                    return { 
                        status: 'error', 
                        message: 'Bad Request: Invalid target URL.', 
                        statusCode: 400 
                    };
                }
            }

            if (targetUrlStr) {
                return {
                    status: 'proxy',
                    targetUrl: targetUrlStr
                };
            }
        }
    }

    // 如果没有匹配到任何规则
    return { status: 'not_found' };
}

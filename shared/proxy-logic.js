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
            } else if (rule.type === 'host') {
                // --- 新增的核心逻辑：处理 'host' 类型 ---
                // 创建一个新的 URL 对象以便修改
                const newUrl = new URL(request.url);
                
                // 直接将主机名替换为目标主机名
                newUrl.hostname = rule.target;
                
                // 将修改后的 URL 对象转换回字符串
                // 此时 URL 的路径和查询参数都保持原样
                targetUrlStr = newUrl.toString();
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

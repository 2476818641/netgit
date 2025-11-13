// shared/proxy-logic.js

import { proxyRules } from './config.js';

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
                // 从路径中提取目标 URL
                targetUrlStr = path.substring(prefix.length);
                
                // ==================== 核心修改部分 开始 ====================
                // 检查提取出的 URL 字符串是否包含协议头 (http:// 或 https://)
                // 这样做是为了让用户在输入时可以省略协议头，提高容错性。
                if (!targetUrlStr.startsWith('http://') && !targetUrlStr.startsWith('https://')) {
                    // 如果没有协议头，默认添加 https://
                    targetUrlStr = 'https://' + targetUrlStr;
                }
                // ==================== 核心修改部分 结束 ====================

                if (url.search) {
                    targetUrlStr += url.search;
                }
                
                try {
                    // 现在 targetUrlStr 是一个完整的 URL，可以安全地被 new URL() 解析
                    let targetDomain = new URL(targetUrlStr).hostname;
                    if (!rule.allowedDomains.some(domain => targetDomain === domain || targetDomain.endsWith('.' + domain))) {
                        return { 
                            status: 'error', 
                            message: 'Forbidden: Domain not allowed for this proxy.', 
                            statusCode: 403 
                        };
                    }
                } catch (e) {
                    // 如果 new URL() 仍然失败（例如 URL 格式完全错误），则返回之前的错误
                    return { 
                        status: 'error', 
                        message: 'Bad Request: Invalid target URL.', 
                        statusCode: 400 
                    };
                }
            } else if (rule.type === 'host') {
                const subpath = path.substring(prefix.length);
                const targetProtocol = rule.target.startsWith('http') ? '' : 'https://';
                targetUrlStr = `${targetProtocol}${rule.target}/${subpath}${url.search}`;
            }

            if (targetUrlStr) {
                return {
                    status: 'proxy',
                    targetUrl: targetUrlStr
                };
            }
        }
    }

    return { status: 'not_found' };
}

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
                // 1. 从路径中提取目标 URL 部分
                let subpath = path.substring(prefix.length);

                // ==================== 核心修改部分 V2 开始 ====================
                // 2. [关键] 清理：移除任何可能存在的前导斜杠
                //    这可以防止用户输入 .../ghproxy//github.com 导致生成无效的 https:///github.com
                if (subpath.startsWith('/')) {
                    subpath = subpath.substring(1);
                }

                // 3. 检查并添加协议头
                if (!subpath.startsWith('http://') && !subpath.startsWith('https://')) {
                    subpath = 'https://' + subpath;
                }
                
                targetUrlStr = subpath;
                // ==================== 核心修改部分 V2 结束 ====================

                if (url.search) {
                    targetUrlStr += url.search;
                }
                
                try {
                    // 现在 targetUrlStr 保证是一个格式正确的 URL
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

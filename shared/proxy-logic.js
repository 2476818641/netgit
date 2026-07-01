import { proxyRules } from './config.js';
import { checkAllTargets, get30DayStats } from './health-checker.js';

export async function handleRequest(request, KV = null) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 对规则按前缀长度降序排序，确保更长的路径优先匹配
    const sortedPrefixes = Object.keys(proxyRules).sort((a, b) => b.length - a.length);

    for (const prefix of sortedPrefixes) {
        if (path.startsWith(prefix)) {
            const rule = proxyRules[prefix];
            let targetUrlStr;

            // 健康检查端点
            if (rule.type === 'health') {
                const checkResults = await checkAllTargets();
                const uptime = typeof process !== 'undefined' && process.uptime ? process.uptime() : 'N/A';

                // 获取30天统计数据
                const stats30d = await get30DayStats(KV);

                const healthData = {
                    status: checkResults.summary.healthy === checkResults.summary.total ? 'healthy' :
                            checkResults.summary.unhealthy === checkResults.summary.total ? 'unhealthy' : 'degraded',
                    timestamp: new Date().toISOString(),
                    uptime: uptime,
                    service: 'NetGit Proxy Service',
                    version: '1.2.0',
                    checks: checkResults,
                    stats30d: stats30d
                };

                return {
                    status: 'health',
                    format: rule.format || 'json',
                    data: healthData
                };
            }

            if (rule.type === 'path') {
                const subpath = path.substring(prefix.length);
                targetUrlStr = `${rule.target}/${subpath}${url.search}`;
            } else if (rule.type === 'url') {
                targetUrlStr = path.substring(prefix.length);
                if (url.search) {
                    targetUrlStr += url.search;
                }
                // Allow scheme-less URLs like github.com/owner/repo
                if (!/^https?:\/\//i.test(targetUrlStr)) {
                    targetUrlStr = `https://${targetUrlStr}`;
                }
                try {
                    let targetDomain = new URL(targetUrlStr).hostname;
                    // 检查目标域名是否在白名单中（完全匹配或作为子域名）
                    const isAllowed = rule.allowedDomains.some(domain => {
                        return targetDomain === domain ||
                               targetDomain.endsWith('.' + domain);
                    });

                    if (!isAllowed) {
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

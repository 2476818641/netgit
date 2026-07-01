import { proxyRules } from './config.js';

// 定义需要检测延迟的目标
const healthCheckTargets = [
  { name: 'GitHub', url: 'https://api.github.com', type: 'api' },
  { name: 'GitHub Raw', url: 'https://raw.githubusercontent.com', type: 'cdn' },
  { name: 'GitLab', url: 'https://gitlab.com', type: 'api' },
  { name: 'Docker Hub', url: 'https://registry-1.docker.io/v2/', type: 'registry' },
  { name: 'NPM Registry', url: 'https://registry.npmjs.org', type: 'registry' },
  { name: 'PyPI', url: 'https://pypi.org', type: 'registry' },
  { name: 'jsDelivr CDN', url: 'https://cdn.jsdelivr.net', type: 'cdn' },
  { name: 'Unpkg CDN', url: 'https://unpkg.com', type: 'cdn' }
];

// 检测单个目标的延迟
async function checkTargetLatency(target) {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

    const response = await fetch(target.url, {
      method: 'HEAD',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    return {
      name: target.name,
      type: target.type,
      url: target.url,
      status: response.ok ? 'healthy' : 'degraded',
      latency: latency,
      statusCode: response.status,
      available: true
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      name: target.name,
      type: target.type,
      url: target.url,
      status: 'unhealthy',
      latency: latency >= 5000 ? 'timeout' : latency,
      error: error.message,
      available: false
    };
  }
}

// 批量检测所有目标
async function checkAllTargets() {
  const results = await Promise.all(
    healthCheckTargets.map(target => checkTargetLatency(target))
  );

  const summary = {
    total: results.length,
    healthy: results.filter(r => r.status === 'healthy').length,
    degraded: results.filter(r => r.status === 'degraded').length,
    unhealthy: results.filter(r => r.status === 'unhealthy').length
  };

  return { targets: results, summary };
}

export async function handleRequest(request) {
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

                const healthData = {
                    status: checkResults.summary.healthy === checkResults.summary.total ? 'healthy' :
                            checkResults.summary.unhealthy === checkResults.summary.total ? 'unhealthy' : 'degraded',
                    timestamp: new Date().toISOString(),
                    uptime: uptime,
                    service: 'NetGit Proxy Service',
                    version: '1.2.0',
                    checks: checkResults
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

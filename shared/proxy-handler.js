// shared/proxy-handler.js

import { handleRequest } from './proxy-logic.js';

export function getCacheControlHeaders(cacheable = true, maxAge = 3600) {
  if (!cacheable) {
    return {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
  }
  
  return {
    'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}`,
    'X-Cache-Status': 'HIT'
  };
}

export function normalizeRequestHeaders(headers) {
  const normalized = {};
  for (const [key, value] of headers.entries()) {
    const lowerKey = key.toLowerCase();
    
    if (lowerKey === 'host') {
      continue;
    }
    
    if (!lowerKey.startsWith('x-forwarded-') && 
        !lowerKey.startsWith('cf-') &&
        lowerKey !== 'cdn-loop') {
      normalized[key] = value;
    }
  }
  return normalized;
}

export async function proxyWithCache(request, cacheManager = null, KV = null) {
  const result = await handleRequest(request, KV);

  switch (result.status) {
    case 'health': {
      // JSON 格式输出
      if (result.format === 'json') {
        return new Response(JSON.stringify(result.data, null, 2), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...getCacheControlHeaders(false)
          }
        });
      }

      // 人类可读的 HTML 格式输出
      const data = result.data;
      const overallStatus = data.status;
      const statusEmoji = overallStatus === 'healthy' ? '✅' : overallStatus === 'degraded' ? '⚠️' : '❌';
      const statusColor = overallStatus === 'healthy' ? '#4caf50' : overallStatus === 'degraded' ? '#ff9800' : '#f44336';

      let targetsHtml = '';
      data.checks.targets.forEach(target => {
        const targetEmoji = target.status === 'healthy' ? '✅' : target.status === 'degraded' ? '⚠️' : '❌';
        const latencyText = target.latency === 'timeout' ? '超时' : target.latency + 'ms';
        const latencyColor = target.latency === 'timeout' ? '#f44336' :
                            target.latency < 200 ? '#4caf50' :
                            target.latency < 500 ? '#ff9800' : '#f44336';

        // 获取30天统计数据
        let stats30dCell = '-';
        if (data.stats30d && data.stats30d.targets[target.name]) {
          const stats = data.stats30d.targets[target.name];
          stats30dCell = '<div style="font-size: 0.85rem;">' +
            '<div>平均: <strong>' + stats.avgLatency + 'ms</strong></div>' +
            '<div>可用率: <strong style="color: ' + (stats.availability >= 99 ? '#4caf50' : stats.availability >= 95 ? '#ff9800' : '#f44336') + ';">' + stats.availability + '%</strong></div>' +
            '</div>';
        }

        targetsHtml += '<tr>' +
          '<td>' + targetEmoji + ' ' + target.name + '</td>' +
          '<td><span class="badge badge-' + target.type + '">' + target.type + '</span></td>' +
          '<td style="color: ' + latencyColor + '; font-weight: bold;">' + latencyText + '</td>' +
          '<td>' + stats30dCell + '</td>' +
          '<td>' + (target.statusCode || '-') + '</td>' +
          '<td><code class="url-code">' + target.url + '</code></td>' +
        '</tr>';
      });

      // 生成统计摘要信息
      let statsInfoHtml = '';
      if (data.stats30d) {
        statsInfoHtml = '<div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">' +
          '<p style="color: #1976d2; margin: 0;"><strong>📊 30天统计数据</strong>：基于 ' + data.stats30d.summary.totalChecks + ' 次检查（' + data.stats30d.summary.daysWithData + ' 天有数据）</p>' +
        '</div>';
      }

      const html = '<!DOCTYPE html>' +
'<html lang="zh-CN">' +
'<head>' +
'    <meta charset="UTF-8">' +
'    <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
'    <title>健康检查 - NetGit 代理服务</title>' +
'    <style>' +
'        * { margin: 0; padding: 0; box-sizing: border-box; }' +
'        body {' +
'            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;' +
'            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);' +
'            padding: 2rem;' +
'            min-height: 100vh;' +
'        }' +
'        .container {' +
'            max-width: 1200px;' +
'            margin: 0 auto;' +
'            background: white;' +
'            border-radius: 16px;' +
'            box-shadow: 0 20px 60px rgba(0,0,0,0.3);' +
'            overflow: hidden;' +
'        }' +
'        .header {' +
'            background: ' + statusColor + ';' +
'            color: white;' +
'            padding: 2rem;' +
'            text-align: center;' +
'        }' +
'        .header h1 {' +
'            font-size: 2.5rem;' +
'            margin-bottom: 0.5rem;' +
'        }' +
'        .status-emoji {' +
'            font-size: 4rem;' +
'            margin-bottom: 1rem;' +
'        }' +
'        .header p {' +
'            opacity: 0.9;' +
'            font-size: 1.1rem;' +
'        }' +
'        .stats {' +
'            display: grid;' +
'            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));' +
'            gap: 1rem;' +
'            padding: 2rem;' +
'            background: #f5f5f5;' +
'        }' +
'        .stat-card {' +
'            background: white;' +
'            padding: 1.5rem;' +
'            border-radius: 8px;' +
'            text-align: center;' +
'            box-shadow: 0 2px 8px rgba(0,0,0,0.1);' +
'        }' +
'        .stat-label {' +
'            color: #666;' +
'            font-size: 0.9rem;' +
'            margin-bottom: 0.5rem;' +
'        }' +
'        .stat-value {' +
'            font-size: 2rem;' +
'            font-weight: bold;' +
'            color: #333;' +
'        }' +
'        .content {' +
'            padding: 2rem;' +
'        }' +
'        h2 {' +
'            color: #333;' +
'            margin-bottom: 1.5rem;' +
'            font-size: 1.8rem;' +
'        }' +
'        table {' +
'            width: 100%;' +
'            border-collapse: collapse;' +
'            background: white;' +
'            border-radius: 8px;' +
'            overflow: hidden;' +
'            box-shadow: 0 2px 8px rgba(0,0,0,0.1);' +
'        }' +
'        th {' +
'            background: #667eea;' +
'            color: white;' +
'            padding: 1rem;' +
'            text-align: left;' +
'            font-weight: 600;' +
'        }' +
'        td {' +
'            padding: 1rem;' +
'            border-bottom: 1px solid #eee;' +
'        }' +
'        tr:last-child td {' +
'            border-bottom: none;' +
'        }' +
'        tr:hover {' +
'            background: #f9f9f9;' +
'        }' +
'        .badge {' +
'            display: inline-block;' +
'            padding: 0.25rem 0.75rem;' +
'            border-radius: 12px;' +
'            font-size: 0.85rem;' +
'            font-weight: 600;' +
'        }' +
'        .badge-api { background: #e3f2fd; color: #1976d2; }' +
'        .badge-cdn { background: #f3e5f5; color: #7b1fa2; }' +
'        .badge-registry { background: #e8f5e9; color: #388e3c; }' +
'        .url-code {' +
'            font-family: "SF Mono", "Menlo", "Consolas", monospace;' +
'            font-size: 0.85rem;' +
'            color: #666;' +
'            word-break: break-all;' +
'        }' +
'        .footer {' +
'            text-align: center;' +
'            padding: 1.5rem;' +
'            color: #666;' +
'            font-size: 0.9rem;' +
'            border-top: 1px solid #eee;' +
'        }' +
'        .footer a {' +
'            color: #667eea;' +
'            text-decoration: none;' +
'        }' +
'        .footer a:hover {' +
'            text-decoration: underline;' +
'        }' +
'        @media (max-width: 768px) {' +
'            body { padding: 1rem; }' +
'            .header h1 { font-size: 1.8rem; }' +
'            .stats { grid-template-columns: 1fr; }' +
'            table { font-size: 0.9rem; }' +
'            th, td { padding: 0.75rem; }' +
'        }' +
'    </style>' +
'</head>' +
'<body>' +
'    <div class="container">' +
'        <div class="header">' +
'            <div class="status-emoji">' + statusEmoji + '</div>' +
'            <h1>服务状态: ' + (overallStatus === 'healthy' ? '正常运行' : overallStatus === 'degraded' ? '部分降级' : '服务异常') + '</h1>' +
'            <p>NetGit 代理服务健康检查报告</p>' +
'            <p style="font-size: 0.9rem; margin-top: 0.5rem;">' + data.timestamp + '</p>' +
'        </div>' +
'        <div class="stats">' +
'            <div class="stat-card">' +
'                <div class="stat-label">总计检查项</div>' +
'                <div class="stat-value">' + data.checks.summary.total + '</div>' +
'            </div>' +
'            <div class="stat-card">' +
'                <div class="stat-label">✅ 健康</div>' +
'                <div class="stat-value" style="color: #4caf50;">' + data.checks.summary.healthy + '</div>' +
'            </div>' +
'            <div class="stat-card">' +
'                <div class="stat-label">⚠️ 降级</div>' +
'                <div class="stat-value" style="color: #ff9800;">' + data.checks.summary.degraded + '</div>' +
'            </div>' +
'            <div class="stat-card">' +
'                <div class="stat-label">❌ 异常</div>' +
'                <div class="stat-value" style="color: #f44336;">' + data.checks.summary.unhealthy + '</div>' +
'            </div>' +
'        </div>' +
'        <div class="content">' +
            statsInfoHtml +
'            <h2>🎯 目标服务延迟检测</h2>' +
'            <table>' +
'                <thead>' +
'                    <tr>' +
'                        <th>服务名称</th>' +
'                        <th>类型</th>' +
'                        <th>实时延迟</th>' +
'                        <th>30天统计</th>' +
'                        <th>状态码</th>' +
'                        <th>目标地址</th>' +
'                    </tr>' +
'                </thead>' +
'                <tbody>' +
                    targetsHtml +
'                </tbody>' +
'            </table>' +
'        </div>' +
'        <div class="footer">' +
'            <p>🚀 <strong>NetGit Proxy Service</strong> v' + data.version + '</p>' +
'            <p style="margin-top: 0.5rem;">' +
'                <a href="/health/json" target="_blank">查看 JSON 格式</a> |' +
'                <a href="/" target="_blank">返回首页</a>' +
'            </p>' +
'        </div>' +
'    </div>' +
'</body>' +
'</html>';

      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...getCacheControlHeaders(false)
        }
      });
    }

    case 'proxy': {
      const targetUrl = result.targetUrl;
      const cacheKey = cacheManager ? cacheManager.generateCacheKey(targetUrl) : null;

      if (cacheKey && cacheManager) {
        const cachedResponse = cacheManager.get(cacheKey);
        if (cachedResponse) {
          console.log(`Cache HIT for: ${targetUrl}`);
          return new Response(cachedResponse.body, {
            ...cachedResponse,
            headers: {
              ...cachedResponse.headers,
              ...getCacheControlHeaders(true, 300)
            }
          });
        }
      }

      console.log(`Cache MISS for: ${targetUrl}`);

      const normalizedHeaders = normalizeRequestHeaders(request.headers);
      
      const newRequest = new Request(targetUrl, {
        headers: new Headers(normalizedHeaders),
        method: request.method,
        body: request.body,
        redirect: 'follow'
      });

      const response = await fetch(newRequest);

      if (cacheKey && cacheManager && 
          request.method === 'GET' && 
          response.ok && 
          response.headers.get('content-length')) {
        
        const contentLength = parseInt(response.headers.get('content-length'));
        if (contentLength < 50 * 1024 * 1024) {
          const clonedResponse = response.clone();
          try {
            const responseToCache = {
              ok: clonedResponse.ok,
              status: clonedResponse.status,
              statusText: clonedResponse.statusText,
              headers: Object.fromEntries(clonedResponse.headers.entries()),
              body: await clonedResponse.arrayBuffer()
            };
            cacheManager.set(cacheKey, responseToCache);
          } catch (e) {
            console.error('Failed to cache response:', e);
          }
        }
      }

      const isCacheable = request.method === 'GET' && response.ok;
      const headers = new Headers(response.headers);
      
      Object.entries(getCacheControlHeaders(isCacheable, 3600)).forEach(([key, value]) => {
        headers.set(key, value);
      });

      headers.set('X-Target-Url', targetUrl);

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }

    case 'error': {
      return new Response(result.message, { 
        status: result.statusCode,
        headers: getCacheControlHeaders(false)
      });
    }

    case 'not_found':
    default: {
      return new Response('Not Found: No matching proxy rule.', { 
        status: 404,
        headers: getCacheControlHeaders(false)
      });
    }
  }
}

export default proxyWithCache;

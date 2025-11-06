// netlify/functions/proxy.js

// 引入共享配置中的各项内容
import {
    ALLOWED_GITHUB_DOMAINS,
    ALLOWED_DOCKER_DOMAINS,
    NETLIFY_HOME_DOMAIN, // 主页域名，用于404页面链接
    NETLIFY_GIT_PROXY_PATH,
    NETLIFY_DOCKER_PROXY_PATH,
    NETLIFY_CATBOX_PROXY_PATH
} from '../../shared/config.js';

exports.handler = async (event, context) => {
    const path = event.path;
    const body = event.body; // 原始请求体
    const headers = event.headers;
    const httpMethod = event.httpMethod;

    const currentDomain = headers.host || NETLIFY_HOME_DOMAIN.replace('https://', '');

    // 通用的代理请求函数
    async function executeProxyRequest(targetUrlString, needsDomainCheck, allowedDomains = [], pathPrefix = '') {
        let parsedTargetUrl;

        if (needsDomainCheck) {
            // 检查目标URL是否合法且在白名单内
            if (!targetUrlString.startsWith('http://') && !targetUrlString.startsWith('https://')) {
                return {
                    statusCode: 400,
                    body: `Bad Request: The URL after ${pathPrefix} must be a full HTTP or HTTPS URL (e.g., ${pathPrefix}https://example.com/file.txt).`
                };
            }
            try {
                parsedTargetUrl = new URL(targetUrlString);
            } catch (e) {
                return { statusCode: 400, body: 'Bad Request: The URL provided is not a valid URL.' };
            }
            const hostname = parsedTargetUrl.hostname;
            const isAllowedDomain = allowedDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
            if (!isAllowedDomain) {
                return {
                    statusCode: 403,
                    body: `Forbidden: This proxy only supports specific domains for this path (${pathPrefix.slice(0, -1)}). Attempted to proxy ${hostname}.`
                };
            }
        } else {
             // 对于不需要域名检查的路径（如catbox），直接解析目标URL
             try {
                parsedTargetUrl = new URL(targetUrlString);
            } catch (e) {
                return { statusCode: 500, body: 'Internal Server Error: Invalid generated target URL.' };
            }
        }

        const fetchHeaders = { ...headers }; // 复制原始请求头

        // 清理或修改可能暴露代理身份的请求头
        delete fetchHeaders['via'];
        delete fetchHeaders['x-netlify-original-pathname'];
        delete fetchHeaders['x-forwarded-for'];
        delete fetchHeaders['x-forwarded-hoost']; // 避免双重代理头
        delete fetchHeaders['x-real-ip'];
        delete fetchHeaders['upgrade-insecure-requests']; // 避免目标服务器不必要的重定向
        
        // 可以自定义 User-Agent，增加匿名性或避免被目标服务器识别为Function
        if (!fetchHeaders['user-agent']) {
            fetchHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 NetlifyFunctionProxy';
        }
        
        delete fetchHeaders['cookie']; // 默认不转发客户端 Cookie 到目标服务器
        delete fetchHeaders['referer']; // 移除 Referer 头，增加匿名性

        try {
            const response = await fetch(parsedTargetUrl.toString(), {
                method: httpMethod,
                headers: fetchHeaders,
                body: body, // 转发原始请求体
                redirect: 'follow', // 遵循目标服务器的重定向
            });

            const responseHeaders = {};
            let isBase64Encoded = false;

            // 复制响应头，移除Set-Cookie和Content-Encoding（Netlify会自动处理）
            response.headers.forEach((value, name) => {
                if (name.toLowerCase() !== 'set-cookie' && name.toLowerCase() !== 'content-encoding' && name.toLowerCase() !== 'transfer-encoding') {
                    responseHeaders[name] = value;
                }
            });

            // 尝试设置缓存控制，优化后续访问
            if (!responseHeaders['Cache-Control']) {
                responseHeaders['Cache-Control'] = 'public, max-age=3600'; // 缓存代理内容1小时
            }
            // 移除帧选项，避免被目标网站限制嵌入
            delete responseHeaders['x-frame-options'];

            // 根据Content-Type判断是否需要进行base64编码
            const contentType = response.headers.get('content-type') || '';
            const isTextType = contentType.startsWith('text/') || 
                               contentType.includes('json') || 
                               contentType.includes('xml') || 
                               contentType.includes('javascript') || 
                               contentType.includes('css');

            let responseBody;
            if (isTextType) {
                responseBody = await response.text();
            } else {
                const buffer = await response.arrayBuffer();
                responseBody = Buffer.from(buffer).toString('base64');
                isBase64Encoded = true;
            }

            return {
                statusCode: response.status,
                headers: responseHeaders,
                body: responseBody,
                isBase64Encoded: isBase64Encoded,
            };

        } catch (error) {
            console.error("Proxy Fetch Error:", error);
            return {
                statusCode: 502,
                body: `Proxy Fetch Error: ${error.message}`
            };
        }
    }

    // 根据路径前缀路由请求到不同的代理逻辑
    let targetPath = '';
    let allowedDomains = [];
    let pathPrefix = '';

    if (path.startsWith(NETLIFY_GIT_PROXY_PATH)) {
        pathPrefix = NETLIFY_GIT_PROXY_PATH;
        allowedDomains = ALLOWED_GITHUB_DOMAINS; // 仅限GitHub相关域名
        targetPath = path.substring(pathPrefix.length);
        return executeProxyRequest(targetPath, true, allowedDomains, pathPrefix);
    } else if (path.startsWith(NETLIFY_DOCKER_PROXY_PATH)) {
        pathPrefix = NETLIFY_DOCKER_PROXY_PATH;
        allowedDomains = ALLOWED_DOCKER_DOMAINS; // 仅限Docker相关域名
        targetPath = path.substring(pathPrefix.length);
        return executeProxyRequest(targetPath, true, allowedDomains, pathPrefix);
    } else if (path.startsWith(NETLIFY_CATBOX_PROXY_PATH)) {
        pathPrefix = NETLIFY_CATBOX_PROXY_PATH;
        targetPath = `https://catbox.moe/${path.substring(pathPrefix.length)}`;
        return executeProxyRequest(targetPath, false); // Catbox 不需要白名单检查
    } else {
        // 对于不匹配任何代理规则的路径，返回404错误页面
        return {
            statusCode: 404,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
            body: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Proxy Service - Not Found</title>
                <style>
                    body { font-family: sans-serif; margin: 2em; line-height: 1.6; background-color: #f4f7f6; color: #333; }
                    .container { background-color: #ffffff; border-radius: 8px; padding: 2em; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 800px; margin: 2em auto; }
                    h1 { color: #cc3300; }
                    p { margin-bottom: 1em; }
                    a { color: #007bff; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                    code { background-color: #e6e6e6; padding: 0.2em 0.4em; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Oops! Page Not Found (404)</h1>
                    <p>The path you requested does not match any of our proxy rules.</p>
                    <p>Please refer to the home page for usage instructions:</p>
                    <p><a href="${NETLIFY_HOME_DOMAIN}">Go to Homepage</a></p>
                    <p>This proxy is powered by <strong>Netlify Functions</strong>.</p>
                </div>
            </body>
            </html>
            `
        };
    }
};

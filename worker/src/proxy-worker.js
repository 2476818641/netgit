// worker/src/proxy-worker.js
import {
    ALLOWED_GITHUB_DOMAINS,
    ALLOWED_DOCKER_DOMAINS,
    CF_PAGES_HOME_DOMAIN,
    PROXY_PATH_GIT,
    PROXY_PATH_DOCKER,
    PROXY_PATH_CATBOX
} from '../../shared/config.js';

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        let targetUrl = '';
        let allowedDomains = [];
        let pathPrefix = '';

        if (path.startsWith(PROXY_PATH_GIT)) {
            pathPrefix = PROXY_PATH_GIT;
            allowedDomains = ALLOWED_GITHUB_DOMAINS;
            targetUrl = path.substring(pathPrefix.length);
            return proxyRequest(request, targetUrl, true, allowedDomains, pathPrefix);
        } else if (path.startsWith(PROXY_PATH_DOCKER)) {
            pathPrefix = PROXY_PATH_DOCKER;
            allowedDomains = ALLOWED_DOCKER_DOMAINS;
            targetUrl = path.substring(pathPrefix.length);
            return proxyRequest(request, targetUrl, true, allowedDomains, pathPrefix);
        } else if (path.startsWith(PROXY_PATH_CATBOX)) {
            pathPrefix = PROXY_PATH_CATBOX;
            targetUrl = `https://catbox.moe/${path.substring(pathPrefix.length)}`;
            return proxyRequest(request, targetUrl, false);
        }

        // 对于所有其他非代理请求，让 Cloudflare Pages 提供静态文件
        // 这是通过不返回任何内容，让请求“掉落”到下一层处理程序来实现的。
        // 如果静态文件存在，它将被提供。如果不存在，Pages会返回自己的404页面。
        // 或者，我们可以显式地调用静态资源处理器：
        return env.ASSETS.fetch(request);
    }
};

// 通用的代理请求函数
async function proxyRequest(originalRequest, targetUrlString, needsDomainCheck, allowedDomains = [], pathPrefix = '') {
    // ... (此函数内容保持不变，为节省篇幅已省略) ...
    // ... (请保留你原来的 proxyRequest 函数代码) ...
    let parsedTargetUrl;

    if (needsDomainCheck) {
        if (!targetUrlString.startsWith('http://') && !targetUrlString.startsWith('https://')) {
            return new Response(`Bad Request: The URL after ${pathPrefix} must be a full HTTP or HTTPS URL.`, { status: 400 });
        }
        try {
            parsedTargetUrl = new URL(targetUrlString);
        } catch (e) {
            return new Response('Bad Request: The URL provided is not valid.', { status: 400 });
        }
        const hostname = parsedTargetUrl.hostname;
        const isAllowedDomain = allowedDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
        if (!isAllowedDomain) {
            return new Response(`Forbidden: Proxying ${hostname} is not allowed for this path.`, { status: 403 });
        }
    } else {
        try {
            parsedTargetUrl = new URL(targetUrlString);
        } catch (e) {
            return new Response('Internal Server Error: Invalid generated target URL.', { status: 500 });
        }
    }

    const proxyRequest = new Request(parsedTargetUrl.toString(), originalRequest);
    proxyRequest.headers.delete('Referer');
    proxyRequest.headers.delete('Cookie');

    try {
        let response = await fetch(proxyRequest, { redirect: 'follow' });
        response = new Response(response.body, response);
        response.headers.delete('Set-Cookie');
        response.headers.set('Cache-Control', 'public, max-age=3600');
        return response;
    } catch (error) {
        return new Response(`Proxy Fetch Error: ${error.message}`, { status: 502 });
    }
}

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

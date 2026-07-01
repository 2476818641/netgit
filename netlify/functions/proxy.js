// netlify/functions/proxy.js

import { proxyWithCache } from '../../shared/proxy-handler.js';
import CacheManager from '../../shared/cache-manager.js';

const netlifyCache = new CacheManager(5 * 60 * 1000);

function toRequestFromEvent(event) {
    const url = event.rawUrl || `https://${event.headers?.host || 'localhost'}${event.path || '/'}`;
    const headers = new Headers(event.headers || {});
    const init = {
        method: event.httpMethod || 'GET',
        headers
    };

    if (event.body) {
        const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;
        init.body = body;
    }

    return new Request(url, init);
}

function isWebRequest(obj) {
    return typeof obj?.url === 'string' && typeof obj?.method === 'string' && obj?.headers;
}

async function handleProxy(request) {
    return await proxyWithCache(request, netlifyCache);
}

export default async (arg, context) => {
    // Netlify Edge Functions pass a Web Request
    if (isWebRequest(arg)) {
        return await handleProxy(arg);
    }

    // Netlify Functions (Node) pass event/context
    const request = toRequestFromEvent(arg);
    const response = await handleProxy(request);
    const body = await response.arrayBuffer();

    return {
        statusCode: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        isBase64Encoded: false,
        body: Buffer.from(body).toString('utf8')
    };
};

export const config = {
    path: "/*"
};

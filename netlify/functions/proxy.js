// netlify/functions/proxy.js

import { proxyWithCache } from '../../shared/proxy-handler.js';
import CacheManager from '../../shared/cache-manager.js';

const netlifyCache = new CacheManager(5 * 60 * 1000);

export default async (req) => {
    const request = new Request(req);
    return await proxyWithCache(request, netlifyCache);
};

export const config = {
    path: "/*"
};

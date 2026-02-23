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

export async function proxyWithCache(request, cacheManager = null) {
  const result = await handleRequest(request);

  switch (result.status) {
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

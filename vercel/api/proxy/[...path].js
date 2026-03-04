const proxyRules = {
  '/ghproxy/': {
    type: 'url',
    allowedDomains: [
      'github.com',
      'raw.githubusercontent.com',
      'user-images.githubusercontent.com',
      'avatars.githubusercontent.com',
      'objects.githubusercontent.com',
      'gist.github.com',
      'github.githubassets.com'
    ]
  },
  '/dockerproxy/': {
    type: 'path',
    target: 'https://registry-1.docker.io'
  },
  '/catbox/': {
    type: 'path',
    target: 'https://files.catbox.moe'
  },
  '/ssh/': {
    type: 'host',
    target: 'subsequent-ardelle-bbttca23-472bd3ef.koyeb.app'
  }
};

class CacheManager {
  constructor(ttl = 5 * 60 * 1000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value) {
    this.cache.set(key, { value, expiry: Date.now() + this.ttl });
  }
}

const vercelCache = new CacheManager();

function getSingleHeaderValue(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function normalizeRequestHeaders(headers) {
  const normalized = {};
  for (const [key, value] of headers.entries()) {
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'host') continue;
    if (!lowerKey.startsWith('x-forwarded-') && !lowerKey.startsWith('cf-') && lowerKey !== 'cdn-loop') {
      normalized[key] = value;
    }
  }
  return normalized;
}

function getCacheHeaders(cacheable = true, maxAge = 3600) {
  if (!cacheable) {
    return {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0'
    };
  }
  return {
    'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}`,
    'X-Cache-Status': 'HIT'
  };
}

function resolveTargetUrl(requestUrl) {
  const url = new URL(requestUrl);
  const path = url.pathname;

  for (const prefix in proxyRules) {
    if (!path.startsWith(prefix)) continue;

    const rule = proxyRules[prefix];
    let targetUrlStr = '';

    if (rule.type === 'path') {
      const subpath = path.substring(prefix.length);
      targetUrlStr = `${rule.target}/${subpath}${url.search}`;
    } else if (rule.type === 'url') {
      targetUrlStr = path.substring(prefix.length);
      if (url.search) targetUrlStr += url.search;
      if (!/^https?:\/\//i.test(targetUrlStr)) {
        targetUrlStr = `https://${targetUrlStr}`;
      }

      let targetDomain;
      try {
        targetDomain = new URL(targetUrlStr).hostname;
      } catch {
        return { error: { status: 400, message: 'Bad Request: Invalid target URL.' } };
      }

      const allowed = rule.allowedDomains.some((domain) => targetDomain === domain || targetDomain.endsWith(`.${domain}`));
      if (!allowed) {
        return { error: { status: 403, message: 'Forbidden: Domain not allowed for this proxy.' } };
      }
    } else if (rule.type === 'host') {
      const subpath = path.substring(prefix.length);
      const targetProtocol = rule.target.startsWith('http') ? '' : 'https://';
      targetUrlStr = `${targetProtocol}${rule.target}/${subpath}${url.search}`;
    }

    if (targetUrlStr) {
      return { targetUrl: targetUrlStr };
    }
  }

  return { error: { status: 404, message: 'Not Found: No matching proxy rule.' } };
}

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function toWebRequest(req) {
  const proto = (getSingleHeaderValue(req.headers['x-forwarded-proto']) || 'https').split(',')[0].trim();
  const host = (getSingleHeaderValue(req.headers['x-forwarded-host']) || req.headers.host || 'localhost').split(',')[0].trim();
  const rawUrl = req.url || '/';
  const rewrittenPath = rawUrl.startsWith('/api/proxy/') ? rawUrl.slice('/api/proxy'.length) : rawUrl;
  const requestUrl = `${proto}://${host}${rewrittenPath}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers || {})) {
    if (typeof value === 'undefined') continue;
    headers.set(key, Array.isArray(value) ? value.join(', ') : String(value));
  }

  return { requestUrl, headers };
}

async function proxyRequest(request) {
  const resolved = resolveTargetUrl(request.url);
  if (resolved.error) {
    return new Response(resolved.error.message, {
      status: resolved.error.status,
      headers: getCacheHeaders(false)
    });
  }

  const targetUrl = resolved.targetUrl;
  const cacheKey = targetUrl;
  const cached = vercelCache.get(cacheKey);

  if (cached) {
    return new Response(cached.body, {
      status: cached.status,
      statusText: cached.statusText,
      headers: {
        ...cached.headers,
        ...getCacheHeaders(true, 300),
        'X-Target-Url': targetUrl
      }
    });
  }

  const normalizedHeaders = normalizeRequestHeaders(request.headers);
  const targetRequest = new Request(targetUrl, {
    method: request.method,
    headers: new Headers(normalizedHeaders),
    body: request.body,
    redirect: 'follow'
  });

  const upstream = await fetch(targetRequest);
  const headers = new Headers(upstream.headers);
  const isCacheable = request.method === 'GET' && upstream.ok;

  Object.entries(getCacheHeaders(isCacheable, 3600)).forEach(([k, v]) => headers.set(k, v));
  headers.set('X-Target-Url', targetUrl);

  if (isCacheable && upstream.headers.get('content-length')) {
    const contentLength = parseInt(upstream.headers.get('content-length'), 10);
    if (contentLength < 50 * 1024 * 1024) {
      const cloned = upstream.clone();
      vercelCache.set(cacheKey, {
        status: cloned.status,
        statusText: cloned.statusText,
        headers: Object.fromEntries(cloned.headers.entries()),
        body: await cloned.arrayBuffer()
      });
    }
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers
  });
}

export default async function handler(req, res) {
  try {
    const method = req.method || 'GET';
    const { requestUrl, headers } = toWebRequest(req);
    const init = { method, headers };

    if (method !== 'GET' && method !== 'HEAD') {
      const body = await readRawBody(req);
      if (body.length > 0) init.body = body;
    }

    const request = new Request(requestUrl, init);
    const response = await proxyRequest(request);
    const body = Buffer.from(await response.arrayBuffer());

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.send(body);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Unknown error'
    });
  }
}

export const config = { api: { bodyParser: false } };

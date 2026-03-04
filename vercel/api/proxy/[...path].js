import { proxyWithCache } from '../../../shared/proxy-handler.js';
import CacheManager from '../../../shared/cache-manager.js';

const vercelCache = new CacheManager(5 * 60 * 1000);

function getSingleHeaderValue(value) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
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

export default async function handler(req, res) {
  try {
    const method = req.method || 'GET';
    const { requestUrl, headers } = toWebRequest(req);

    const init = { method, headers };
    if (method !== 'GET' && method !== 'HEAD') {
      const body = await readRawBody(req);
      if (body.length > 0) {
        init.body = body;
      }
    }

    const request = new Request(requestUrl, init);
    const response = await proxyWithCache(request, vercelCache);
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

export const config = {
  api: {
    bodyParser: false
  }
};

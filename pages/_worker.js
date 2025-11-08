// C:\Users\liuasd\Desktop\netgit-main\pages\_worker.js

// 导入共享的配置和代理逻辑
import { generateStaticHomePage } from '../shared/config.js';
import { handleRequest as handleProxyRequest } from '../shared/proxy-logic.js';

export default {
  /**
   * Cloudflare Pages 的主处理函数
   * @param {Request} request - 传入的请求
   * @param {object} env - 环境变量
   * @param {object} context - 执行上下文
   * @returns {Promise<Response>}
   */
  async fetch(request, env, context) {
    const url = new URL(request.url);

    // --- 路由 1: 静态主页 ---
    if (url.pathname === '/') {
      const platformName = "Cloudflare Pages";
      const currentHomeDomain = `https://${url.hostname}`;
      const homePageHtml = generateStaticHomePage(platformName, currentHomeDomain);
      
      return new Response(homePageHtml, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // --- 路由 2: 代理逻辑 ---
    const proxyResult = await handleProxyRequest(request);

    if (proxyResult.status !== 'proxy') {
      const message = proxyResult.message || 'Not Found: No matching proxy rule for this path.';
      const status = proxyResult.statusCode || 404;
      return new Response(message, { status });
    }

    const targetUrl = new URL(proxyResult.targetUrl);

    // --- 关键逻辑：检查是否为 WebSocket 升级请求 ---
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader && upgradeHeader.toLowerCase() === 'websocket') {
      return this.proxyWebSocket(request, targetUrl);
    }

    // --- 普通 HTTP 请求 ---
    const newRequest = new Request(targetUrl.toString(), request);
    return fetch(newRequest);
  },

  /**
   * 使用 WebSocketPair API 透明地代理 WebSocket 连接。
   * @param {Request} request - 原始的 WebSocket 升级请求
   * @param {URL} targetUrl - 目标服务器的 URL
   */
  async proxyWebSocket(request, targetUrl) {
    const wsTargetUrl = new URL(targetUrl);
    wsTargetUrl.protocol = wsTargetUrl.protocol.replace('http', 'ws');

    const webSocketPair = new WebSocketPair();
    const [clientWebSocket, serverWebSocket] = webSocketPair;

    serverWebSocket.accept();

    const originRequest = new Request(wsTargetUrl.toString(), request);

    try {
      const originResponse = await fetch(originRequest, { webSocket: serverWebSocket });

      if (originResponse.status !== 101) {
        serverWebSocket.close(1011, "Upstream connection error");
        return new Response(`Failed to establish WebSocket with origin. Status: ${originResponse.status}`, {
          status: originResponse.status,
          statusText: originResponse.statusText,
        });
      }
      
      return new Response(null, {
        status: 101,
        webSocket: clientWebSocket,
      });

    } catch (e) {
      serverWebSocket.close(1011, "Proxy connection error");
      return new Response(`WebSocket proxy failed: ${e.message}`, { status: 500 });
    }
  },
};
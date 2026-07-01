// shared/config.js

/**
 * GitHub 用户名，用于生成指向你 GitHub 仓库的链接。
 * !! 重要 !! 请务必将其替换为您自己的 GitHub 用户名。
 */
export const GITHUB_USERNAME = "2476818641"; // 务必替换

/**
 * 你的 Netlify 部署后获得的域名。
 * 如果你未部署到 Netlify，请留空。
 */
export const NETLIFY_HOME_DOMAIN = ""; 

/**
 * 你的 Cloudflare Pages 部署后获得的域名。
 * 如果你未部署到 Cloudflare Pages，请留空。
 */
export const CF_PAGES_HOME_DOMAIN = "https://cf.liuass.eu.org"; 

/**
 * 你的 Vercel 部署后获得的域名。
 * 如果你未部署到 Vercel，请留空。
 */
export const VERCEL_HOME_DOMAIN = "https://vercel.20061021.xyz";

/**
 * 定义代理服务的规则。
 * type: 'url' - 代理路径后跟完整 URL；'path' - 代理路径映射到目标站点的路径； 'host' - 透明转发，保留头部信息。
 * examplePath: 用于生成使用示例。
 * allowedDomains: type='url' 时，允许代理的域名列表。
 */
export const proxyRules = {
  '/health': {
    type: 'health',
    description: '健康检查端点',
    examplePath: ''
  },
  '/ghproxy/': {
    type: 'url',
    description: 'GitHub 资源代理',
    examplePath: 'https://github.com/louislam/uptime-kuma/archive/refs/tags/2.0.2.zip',
    allowedDomains: [
      'github.com', 'raw.githubusercontent.com', 'user-images.githubusercontent.com',
      'avatars.githubusercontent.com', 'objects.githubusercontent.com', 'gist.github.com',
      'github.githubassets.com', 'camo.githubusercontent.com', 'gist.githubusercontent.com'
    ]
  },
  '/gitlab/': {
    type: 'url',
    description: 'GitLab 资源代理',
    examplePath: 'https://gitlab.com/username/project/-/archive/main/project-main.zip',
    allowedDomains: ['gitlab.com', 'gitlab.io']
  },
  '/dockerproxy/': {
    type: 'path',
    target: 'https://registry-1.docker.io',
    description: 'Docker Hub 镜像代理',
    examplePath: 'v2/'
  },
  '/gcr/': {
    type: 'path',
    target: 'https://gcr.io',
    description: 'Google Container Registry 代理',
    examplePath: 'v2/'
  },
  '/quay/': {
    type: 'path',
    target: 'https://quay.io',
    description: 'Quay.io 容器镜像代理',
    examplePath: 'v2/'
  },
  '/ghcr/': {
    type: 'path',
    target: 'https://ghcr.io',
    description: 'GitHub Container Registry 代理',
    examplePath: 'v2/'
  },
  '/npm/': {
    type: 'path',
    target: 'https://registry.npmjs.org',
    description: 'NPM 包注册表代理',
    examplePath: 'vue'
  },
  '/pypi/': {
    type: 'path',
    target: 'https://pypi.org',
    description: 'PyPI Python 包代理',
    examplePath: 'simple/pip/'
  },
  '/maven/': {
    type: 'path',
    target: 'https://repo1.maven.org/maven2',
    description: 'Maven Central 仓库代理',
    examplePath: 'org/springframework/spring-core/'
  },
  '/jsdelivr/': {
    type: 'path',
    target: 'https://cdn.jsdelivr.net',
    description: 'jsDelivr CDN 代理',
    examplePath: 'npm/vue@3/dist/vue.global.js'
  },
  '/unpkg/': {
    type: 'path',
    target: 'https://unpkg.com',
    description: 'Unpkg CDN 代理',
    examplePath: 'vue@3/dist/vue.global.js'
  },
  '/imgur/': {
    type: 'path',
    target: 'https://i.imgur.com',
    description: 'Imgur 图片代理',
    examplePath: 'abc123.jpg'
  },
  '/catbox/': {
    type: 'path',
    target: 'https://files.catbox.moe',
    description: 'Catbox.moe 文件代理',
    examplePath: 'yqh1it.png'
  },
  '/ssh/': {
    type: 'host',
    target: 'subsequent-ardelle-bbttca23-472bd3ef.koyeb.app',
    description: 'Koyeb WebSSH 透明代理 (Host 模式)',
    examplePath: ' '
  },
  '/': {
    type: 'url',
    description: '通用 URL 代理（根路径）',
    examplePath: 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/refs/heads/master/Clash/config/ACL4SSR_Online.ini',
    allowedDomains: [
      // GitHub 相关
      'github.com', 'raw.githubusercontent.com', 'user-images.githubusercontent.com',
      'avatars.githubusercontent.com', 'objects.githubusercontent.com', 'gist.github.com',
      'github.githubassets.com', 'camo.githubusercontent.com', 'gist.githubusercontent.com',
      // GitLab
      'gitlab.com', 'gitlab.io',
      // Bitbucket
      'bitbucket.org',
      // 其他代码托管
      'gitee.com', 'coding.net',
      // CDN 资源
      'cdn.jsdelivr.net', 'unpkg.com', 'cdnjs.cloudflare.com',
      // 图片托管
      'i.imgur.com', 'imgur.com', 'files.catbox.moe', 'i.postimg.cc',
      // 文档和资源
      'raw.githubusercontent.com'
    ]
  }
};

/**
 * 生成静态主页的 HTML 内容。
 * @param {string} platformName - 部署的平台名称 (例如 "Cloudflare Pages", "Netlify")。
 * @param {string} currentHomeDomain - 当前网站的主域名。
 * @returns {string} - 生成的 HTML 字符串。
 */
export const generateStaticHomePage = (platformName, currentHomeDomain) => {
  let proxyListHtml = '';
  for (const prefix in proxyRules) {
    const rule = proxyRules[prefix];

    // 跳过健康检查端点，不在主页显示
    if (rule.type === 'health') {
      continue;
    }

    let modeDescription = '';
    let modeBadgeClass = '';
    switch(rule.type) {
        case 'path':
          modeDescription = '路径映射';
          modeBadgeClass = 'badge-path';
          break;
        case 'url':
          modeDescription = 'URL 参数';
          modeBadgeClass = 'badge-url';
          break;
        case 'host':
          modeDescription = 'Host 模式';
          modeBadgeClass = 'badge-host';
          break;
        default:
          modeDescription = '未知';
          modeBadgeClass = 'badge-default';
    }

    const examplePathSegment = rule.type === 'url'
      ? rule.examplePath.replace(/^https?:\/\//, '')
      : rule.examplePath;

    const safeExamplePath = examplePathSegment || 'example';
    const fullExample = `${currentHomeDomain}${prefix}${safeExamplePath}`;

    proxyListHtml += `
      <div class="rule-card">
        <div class="rule-header">
          <h3>${rule.description}</h3>
          <span class="badge ${modeBadgeClass}">${modeDescription}</span>
        </div>
        <ul>
          <li><strong>代理路径:</strong> <code>${prefix}</code></li>
          ${rule.target ? `<li><strong>目标源站:</strong> <code>${rule.target}</code></li>` : ''}
          <li>
            <strong>使用示例:</strong>
            <div class="example-container">
              <pre><code id="example-${prefix.replace(/\//g, '-')}">${fullExample}</code></pre>
              <button class="copy-btn" onclick="copyToClipboard('example-${prefix.replace(/\//g, '-')}', this)" title="复制示例">
                📋
              </button>
            </div>
          </li>
        </ul>
      </div>
    `;
  }

  const projectName = "NetGit"; 
  const repoName = "netgit";
  const githubRepoUrl = `https://github.com/${GITHUB_USERNAME}/${repoName}`;
  const pageTitle = `${projectName} - 开源双平台代理服务`; 
  const pageDescription = `${projectName}: 开源双平台通用代理服务！轻松部署到 Cloudflare Pages & Netlify，为 GitHub, Docker Hub, Catbox 提供稳定代理。立即访问 GitHub 了解详情！`;
  const faviconSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>`;

  return `
<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO Meta Tags -->
    <title>${pageTitle}</title>
    <meta name="description" content="${pageDescription}">
    <meta name="keywords" content="${projectName}, 代理服务, 开源, Cloudflare Pages, Netlify, GitHub代理, Docker代理, Catbox代理, Koyeb代理, 反向代理, CDN, 部署, Host模式">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${currentHomeDomain}">
    <meta property="og:title" content="${pageTitle}">
    <meta property="og:description" content="${pageDescription}">
    <meta property="og:image" content="${currentHomeDomain}/og-image.png"> 

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${currentHomeDomain}">
    <meta name="twitter:title" content="${pageTitle}">
    <meta name="twitter:description" content="${pageDescription}">
    <meta name="twitter:image" content="${currentHomeDomain}/twitter-image.png"> 

    <link rel="icon" href="data:image/svg+xml,${encodeURIComponent(faviconSvg)}">
    
    <style>
        :root {
            --bg-color: #f7f9fc;
            --text-color: #333;
            --card-bg-color: #ffffff;
            --card-border-color: #e0e6ed;
            --code-bg-color: #e8f0fe;
            --pre-bg-color: #282c34;
            --pre-text-color: #abb2bf;
            --link-color: #3498db;
            --header-color: #2c3e50;
            --note-bg-color: #fff3cd;
            --note-text-color: #856404;
            --note-border-color: #ffeeba;
            --shadow-color: rgba(0,0,0,0.08);
            --toggle-bg: #ccc;
            --toggle-fg: white;
            --toggle-icon: '🌙';
        }

        html[data-theme="dark"] {
            --bg-color: #1a1a1a;
            --text-color: #e0e0e0;
            --card-bg-color: #2c2c2c;
            --card-border-color: #444;
            --code-bg-color: #3a3a3a;
            --pre-bg-color: #21252b;
            --pre-text-color: #abb2bf;
            --link-color: #5dade2;
            --header-color: #e0e0e0;
            --note-bg-color: #4d443a;
            --note-text-color: #ffd79c;
            --note-border-color: #6d5b4a;
            --shadow-color: rgba(0,0,0,0.4);
            --toggle-bg: #555;
            --toggle-fg: #1a1a1a;
            --toggle-icon: '☀️';
        }
        
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
            margin: 0; 
            padding: 2rem; 
            background-color: var(--bg-color); 
            color: var(--text-color); 
            line-height: 1.6;
            transition: background-color 0.3s, color 0.3s;
        }
        .container { 
            background-color: var(--card-bg-color); 
            border-radius: 12px; 
            box-shadow: 0 4px 20px var(--shadow-color); 
            padding: 2.5rem; 
            max-width: 800px; 
            margin: 0 auto; 
            border: 1px solid var(--card-border-color); 
            transition: background-color 0.3s, border-color 0.3s;
        }
        h1 { 
            color: var(--header-color); 
            text-align: center; 
            margin-bottom: 1rem; 
            font-size: 2.2rem; 
            border-bottom: 2px solid var(--card-border-color); 
            padding-bottom: 0.5rem; 
        }
        h2 { 
            color: var(--header-color); 
            font-size: 1.6rem; 
            margin-top: 2rem; 
            margin-bottom: 1rem; 
        }
        h3 {
            color: var(--link-color);
            font-size: 1.2rem;
            margin-top: 0;
            margin-bottom: 0.5rem;
        }
        .rule-card {
            border: 1px solid var(--card-border-color);
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .rule-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px var(--shadow-color);
        }
        .rule-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        .badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 600;
            white-space: nowrap;
        }
        .badge-path {
            background-color: #e3f2fd;
            color: #1976d2;
        }
        .badge-url {
            background-color: #f3e5f5;
            color: #7b1fa2;
        }
        .badge-host {
            background-color: #e8f5e9;
            color: #388e3c;
        }
        html[data-theme="dark"] .badge-path {
            background-color: #1565c0;
            color: #bbdefb;
        }
        html[data-theme="dark"] .badge-url {
            background-color: #6a1b9a;
            color: #e1bee7;
        }
        html[data-theme="dark"] .badge-host {
            background-color: #2e7d32;
            color: #c8e6c9;
        }
        .example-container {
            position: relative;
            margin-top: 0.5rem;
        }
        .copy-btn {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: var(--code-bg-color);
            border: 1px solid var(--card-border-color);
            border-radius: 4px;
            padding: 0.4rem 0.6rem;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.2s;
            opacity: 0.7;
        }
        .copy-btn:hover {
            opacity: 1;
            transform: scale(1.1);
            background: var(--link-color);
        }
        .copy-btn.copied {
            background: #4caf50;
        }
        .copy-btn.copied::after {
            content: '✓';
            position: absolute;
            top: -1.5rem;
            right: 0;
            background: #4caf50;
            color: white;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            white-space: nowrap;
        }
        code {
            background-color: var(--code-bg-color);
            padding: 0.3em 0.5em;
            border-radius: 4px;
            font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
            font-size: 0.9em;
            word-break: break-all;
        }
        pre {
            background-color: var(--pre-bg-color);
            color: var(--pre-text-color);
            padding: 1em 3em 1em 1.5em;
            border-radius: 8px;
            overflow-x: auto;
            font-size: 0.85em;
            margin: 0;
            position: relative;
        }
        pre code {
            background: none;
            padding: 0;
        }
        ul { 
            list-style-type: none; 
            padding-left: 0; 
        }
        li { 
            margin-bottom: 0.8em; 
        }
        a { 
            color: var(--link-color); 
            text-decoration: none; 
        }
        a:hover { 
            text-decoration: underline; 
        }
        .note { 
            background-color: var(--note-bg-color); 
            color: var(--note-text-color); 
            border: 1px solid var(--note-border-color); 
            padding: 1.2rem; 
            border-radius: 8px; 
            margin-top: 2rem; 
        }
        .footer { 
            text-align: center; 
            margin-top: 3rem; 
            border-top: 1px solid var(--card-border-color); 
            padding-top: 2rem; 
            font-size: 0.9em; 
            color: #7f8c8d; 
        }
        #theme-toggle {
            position: fixed;
            top: 1rem;
            right: 1rem;
            background: var(--toggle-bg);
            color: var(--text-color);
            border: 1px solid var(--card-border-color);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            transition: background-color 0.3s, transform 0.3s;
        }
        #theme-toggle:hover {
            transform: scale(1.1);
        }
        #theme-toggle::after {
            content: var(--toggle-icon);
        }
        .stats {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 1rem;
            margin: 2rem 0;
            padding: 1.5rem;
            background: var(--code-bg-color);
            border-radius: 8px;
        }
        .stat-item {
            text-align: center;
        }
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: var(--link-color);
        }
        .stat-label {
            font-size: 0.9rem;
            color: var(--text-color);
            opacity: 0.8;
        }
        @media (max-width: 768px) {
            body {
                padding: 1rem;
            }
            .container {
                padding: 1.5rem;
            }
            h1 {
                font-size: 1.8rem;
            }
            .rule-header {
                flex-direction: column;
                align-items: flex-start;
            }
            .stats {
                padding: 1rem;
            }
            .stat-number {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <button id="theme-toggle" title="切换深色/浅色模式"></button>

    <div class="container">
        <h1>欢迎访问 ${projectName} 代理服务</h1>

        <p>
            这是一个由 <strong>${platformName || 'Cloudflare Pages/Netlify'}</strong> 托管的 ${projectName} 服务入口 (${currentHomeDomain.replace('https://', '')})。
            本服务旨在提供灵活、快速的代理能力，帮助您轻松访问 GitHub、Docker Hub、NPM、PyPI 等资源。
        </p>

        <div class="stats">
            <div class="stat-item">
                <div class="stat-number">${Object.keys(proxyRules).length - 1}</div>
                <div class="stat-label">代理规则</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">✓</div>
                <div class="stat-label">健康状态</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">24/7</div>
                <div class="stat-label">在线服务</div>
            </div>
        </div>

        <h2>🚀 ${projectName} 代理规则列表</h2>
        <p>以下是该服务当前支持的代理规则，点击 📋 按钮可快速复制使用示例。</p>
        
        ${proxyListHtml}
        
        <div class="note">
            <strong>重要提示：</strong>
            <ul>
                <li><strong>URL 参数模式:</strong> 代理路径后必须跟上完整的、在白名单内的 URL。</li>
                <li><strong>路径映射模式:</strong> 代理路径后直接跟上目标站点的文件路径。</li>
                <li><strong>Host 模式 (透明转发):</strong> 专为需要保留 Host 头等信息的应用设计。它会剥离代理路径，将剩余路径完整转发到目标域名（当然也可以像我一样用来来缩短域名）。</li>
            </ul>
            <p>
                <strong>注意：</strong> 此页面仅为服务入口和规则说明。完整项目和部署细节请访问 
                <a href="${githubRepoUrl}" target="_blank" rel="noopener noreferrer">${githubRepoUrl}</a>。
            </p>
        </div>

        <div class="footer">
            <p>
                <a href="${githubRepoUrl}" target="_blank" rel="noopener noreferrer">查看 ${projectName} 源码 on GitHub</a>
            </p>
        </div>
    </div>

    <script>
      // 主题切换功能
      (function() {
        const themeToggle = document.getElementById('theme-toggle');
        const html = document.documentElement;

        function applyTheme(theme) {
          html.setAttribute('data-theme', theme);
          localStorage.setItem('theme', theme);
        }

        themeToggle.addEventListener('click', () => {
          const currentTheme = html.getAttribute('data-theme');
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
          applyTheme(newTheme);
        });

        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
          applyTheme(savedTheme);
        } else if (prefersDark) {
          applyTheme('dark');
        }
      })();

      // 复制到剪贴板功能
      function copyToClipboard(elementId, button) {
        const element = document.getElementById(elementId);
        const text = element.textContent;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(() => {
            showCopySuccess(button);
          }).catch(err => {
            fallbackCopy(text, button);
          });
        } else {
          fallbackCopy(text, button);
        }
      }

      // 降级复制方法
      function fallbackCopy(text, button) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          showCopySuccess(button);
        } catch (err) {
          console.error('复制失败:', err);
        }
        document.body.removeChild(textarea);
      }

      // 显示复制成功提示
      function showCopySuccess(button) {
        button.classList.add('copied');
        button.textContent = '✓';
        setTimeout(() => {
          button.classList.remove('copied');
          button.textContent = '📋';
        }, 2000);
      }
    </script>
</body>
</html>
`;
};

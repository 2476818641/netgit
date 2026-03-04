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
export const VERCEL_HOME_DOMAIN = "https://liudds.de5.net";

/**
 * 定义代理服务的规则。
 * type: 'url' - 代理路径后跟完整 URL；'path' - 代理路径映射到目标站点的路径； 'host' - 透明转发，保留头部信息。
 * examplePath: 用于生成使用示例。
 * allowedDomains: type='url' 时，允许代理的域名列表。
 */
export const proxyRules = {
  '/ghproxy/': {
    type: 'url',
    description: 'GitHub 资源代理',
    examplePath: 'https://github.com/louislam/uptime-kuma/archive/refs/tags/2.0.2.zip',
    allowedDomains: ['github.com', 'raw.githubusercontent.com', 'user-images.githubusercontent.com', 'avatars.githubusercontent.com', 'objects.githubusercontent.com', 'gist.github.com', 'github.githubassets.com']
  },
  '/dockerproxy/': {
    type: 'path',
    target: 'https://registry-1.docker.io',
    description: 'Docker Hub 镜像代理',
    examplePath: 'v2/' 
  },
  '/catbox/': {
    type: 'path',
    target: 'https://files.catbox.moe',
    description: 'Catbox.moe 文件代理',
    examplePath: 'yqh1it.png' 
  },
  '/ssh/': {
    type: 'host',
    target: 'subsequent-ardelle-bbttca23-472bd3ef.koyeb.app', // 目标域名，无需协议
    description: 'Koyeb WebSSH 透明代理 (Host 模式)',
    examplePath: ' ' 
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
    let modeDescription = '';
    switch(rule.type) {
        case 'path': modeDescription = '路径映射'; break;
        case 'url': modeDescription = 'URL 参数'; break;
        case 'host': modeDescription = 'Host 模式 (透明转发)'; break;
        default: modeDescription = '未知';
    }

    const examplePathSegment = rule.type === 'url'
      ? rule.examplePath.replace(/^https?:\/\//, '')
      : rule.examplePath;

    const safeExamplePath = examplePathSegment || 'example'; 
    const fullExample = `${currentHomeDomain}${prefix}${safeExamplePath}`;
    
    proxyListHtml += `
      <div class="rule-card">
        <h3>${rule.description}</h3>
        <ul>
          <li><strong>代理路径:</strong> <code>${prefix}</code></li>
          <li><strong>代理模式:</strong> <code>${modeDescription}</code></li>
          ${rule.target ? `<li><strong>目标源站:</strong> <code>${rule.target}</code></li>` : ''}
          <li><strong>使用示例:</strong> <pre><code>${fullExample}</code></pre></li>
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
            margin-top: 1.5rem; 
        }
        .rule-card { 
            border: 1px solid var(--card-border-color); 
            padding: 0 1.5rem 1.5rem; 
            border-radius: 8px; 
            margin-bottom: 1.5rem;
        }
        code { 
            background-color: var(--code-bg-color); 
            padding: 0.3em 0.5em; 
            border-radius: 4px; 
            font-family: 'SF Mono', 'Menlo', 'Consolas', monospace; 
            font-size: 0.9em; 
        }
        pre { 
            background-color: var(--pre-bg-color); 
            color: var(--pre-text-color); 
            padding: 1em 1.5em; 
            border-radius: 8px; 
            overflow-x: auto; 
            font-size: 0.9em; 
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
    </style>
</head>
<body>
    <button id="theme-toggle" title="切换深色/浅色模式"></button>
    
    <div class="container">
        <h1>欢迎访问 ${projectName} 代理服务</h1> 
        
        <p>
            这是一个由 <strong>${platformName || 'Cloudflare Pages/Netlify'}</strong> 托管的 ${projectName} 服务入口 (${currentHomeDomain.replace('https://', '')})。 
            本服务旨在提供灵活、快速的代理能力，帮助您轻松访问 GitHub、Docker Hub 等资源。
        </p>
        
        <h2>🚀 ${projectName} 代理规则列表</h2>
        <p>以下是该服务当前支持的代理规则，您可以方便地使用它们来访问特定的网络资源。</p>
        
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
    </script>
</body>
</html>
`;
};

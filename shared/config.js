// shared/config.js

export const ALLOWED_GITHUB_DOMAINS = [
    'github.com',
    'raw.githubusercontent.com',
    'user-images.githubusercontent.com',
    'avatars.githubusercontent.com',
    'objects.githubusercontent.com',
    'gist.github.com',
    'github.githubassets.com'
];

export const ALLOWED_DOCKER_DOMAINS = [
    'docker.com',
    'docs.docker.com',
    'hub.docker.com',
    'www.docker.com',
    'desktop.docker.com',
    'store.docker.com',
    'registry.hub.docker.com',
    'registry-1.docker.io',
    'oauth.docker.com',
    'production.cloud.docker.com'
];

// 请替换为您的 GitHub 用户名，以便一键部署按钮能正确指向您的仓库
export const GITHUB_USERNAME = "2476818641"; 

// 部署后，请将这些占位符更新为您的实际域名
export const NETLIFY_HOME_DOMAIN = "https://plp.liudds.eu.org"; // 你的 Netlify 站点主页域名
export const CF_PAGES_HOME_DOMAIN = "https://cf.liudds.eu.org"; // 你的 Cloudflare Pages 站点主页域名

// 统一所有平台的代理路径
export const PROXY_PATH_GIT = "/ghproxy/";
export const PROXY_PATH_DOCKER = "/dockerproxy/";
export const PROXY_PATH_CATBOX = "/catbox/";

// 通用的HTML主页模板函数
export const generateStaticHomePage = (platformName, currentHomeDomain, otherPlatformHomeLink) => {
  const isWorkersPage = platformName === 'Cloudflare Pages';
  
  const githubExample = `${currentHomeDomain}${PROXY_PATH_GIT}https://github.com/louislam/uptime-kuma/archive/refs/tags/2.0.2.zip`;
  const githubReadmeExample = `${currentHomeDomain}${PROXY_PATH_GIT}https://raw.githubusercontent.com/louislam/uptime-kuma/refs/heads/master/README.md`;
  const dockerExample = `${currentHomeDomain}${PROXY_PATH_DOCKER}https://docs.docker.com/images/docs-art/whale.png`;
  const catboxFilePath = 'lq52ie.jpg'; // 示例 catbox 文件路径
  const catboxExample = `${currentHomeDomain}${PROXY_PATH_CATBOX}${catboxFilePath}`;

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>代理加速服务 - ${currentHomeDomain.replace('https://', '')}</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌐</text></svg>">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 2em; background-color: #f7f9fc; color: #333; line-height: 1.6; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; box-sizing: border-box; }
        .container { background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 2.5em; max-width: 800px; width: 100%; border: 1px solid #e0e6ed; }
        h1 { color: #2c3e50; text-align: center; margin-bottom: 1em; font-size: 2.2em; border-bottom: 2px solid #e0e6ed; padding-bottom: 0.5em; }
        h2 { color: #34495e; font-size: 1.5em; margin-top: 1.5em; margin-bottom: 0.8em; }
        p { margin-bottom: 1em; }
        code { background-color: #e8f0fe; padding: 0.3em 0.5em; border-radius: 4px; font-family: 'Consolas', 'Monaco', monospace; font-size: 0.9em; overflow-wrap: break-word; word-break: break-all; }
        pre { background-color: #282c34; color: #abb2bf; padding: 1em 1.5em; border-radius: 8px; overflow-x: auto; font-family: 'Consolas', 'Monaco', monospace; font-size: 0.9em; }
        ul { list-style-type: none; padding-left: 0; }
        li { margin-bottom: 0.8em; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .note { background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba; padding: 1em; border-radius: 8px; margin-top: 2em; }
        .footer-links { text-align: center; margin-top: 3em; border-top: 1px solid #e0e6ed; padding-top: 2em; font-size: 0.9em; color: #7f8c8d; }
    </style>
</head>
<body>
    <div class="container">
        <h1>欢迎访问您的自定义代理服务</h1>
        <p>这里是 <code>${currentHomeDomain.replace('https://', '')}</code>，一个为您提供特定反向代理功能的服务。</p>
        
        <h2>🚀 功能列表</h2>

        <h3>1. GitHub & Docker 资源代理</h3>
        <p>代理 GitHub 和 Docker 相关域名的资源，便于在某些网络环境下访问。</p>
        <ul>
            <li><strong>使用方式：</strong> 在域名后加上 <code>${PROXY_PATH_GIT}</code> 或 <code>${PROXY_PATH_DOCKER}</code>，再跟上您要代理的<strong>完整目标URL</strong>。</li>
            <li><strong>GitHub 示例：</strong> <pre><code>${githubExample}</code></pre></li>
            <li><strong>Docker 示例：</strong> <pre><code>${dockerExample}</code></pre></li>
        </ul>

        <h3>2. Catbox.moe 反向代理</h3>
        <p>安全匿名地访问 <code>https://catbox.moe/</code> 上的内容。</p>
        <ul>
            <li><strong>使用方式：</strong> 在域名后加上 <code>${PROXY_PATH_CATBOX}</code>，再跟上 Catbox 上的文件路径。</li>
            <li><strong>示例：</strong> 访问文件 <code>${catboxFilePath}</code></li>
            <li><strong>访问地址：</strong> <pre><code><a href="${catboxExample}">${catboxExample}</a></code></pre></li>
        </ul>
        
        <div class="note">
            <strong>重要提示：</strong>
            <ul>
                <li>请确保在代理路径 (例如 <code>${PROXY_PATH_GIT}</code>) 之后提供的 URL 是<strong>完整且正确的</strong> (包含 <code>https://</code>)。</li>
                <li>此服务旨在提供便利，请<strong>合法合规</strong>使用。</li>
            </ul>
        </div>

        <div class="footer-links">
            <p>该服务主页托管于 <strong>${platformName}</strong> | <a href="https://github.com/${GITHUB_USERNAME}/netgit" target="_blank">查看源码</a></p>
        </div>
    </div>
</body>
</html>
`;
};

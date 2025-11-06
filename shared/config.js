// shared/config.js

// 你的 GitHub 用户名
export const GITHUB_USERNAME = "2476818641";

// 部署后获得的域名 (如果只部署一个，另一个留空)
export const NETLIFY_HOME_DOMAIN = "https://plp.liudds.eu.org";
export const CF_PAGES_HOME_DOMAIN = "https://cf.liudds.eu.org";

/**
 * 代理规则配置
 * 
 * type 'url': 代理路径后的内容必须是完整的 URL。例如 /ghproxy/https://github.com/...
 * type 'path': 代理路径后的内容是子路径，会自动拼接到 target 上。例如 /dockerproxy/v2/... 会被代理到 target/v2/...
 */
export const proxyRules = {
  // GitHub 代理: 维持 URL 参数模式
  '/ghproxy/': {
    type: 'url',
    description: 'GitHub 资源代理',
    examplePath: 'https://github.com/louislam/uptime-kuma/archive/refs/tags/2.0.2.zip',
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
  // Docker 代理: 切换为路径映射模式
  '/dockerproxy/': {
    type: 'path',
    target: 'https://registry-1.docker.io',
    description: 'Docker Hub 镜像代理',
    examplePath: 'v2/'
  },
  // Catbox 代理: 切换为路径映射模式
  '/catbox/': {
    type: 'path',
    target: 'https://files.catbox.moe',
    description: 'Catbox.moe 文件代理',
    examplePath: 'lq52ie.jpg'
  }
};

// 通用的HTML主页模板函数 (已更新以反映新规则)
export const generateStaticHomePage = (platformName, currentHomeDomain) => {
  let proxyListHtml = '';
  for (const prefix in proxyRules) {
    const rule = proxyRules[prefix];
    const fullExample = rule.type === 'url' 
      ? `${currentHomeDomain}${prefix}${rule.examplePath}`
      : `${currentHomeDomain}${prefix}${rule.examplePath}`;
    
    proxyListHtml += `
      <h3>${rule.description}</h3>
      <ul>
        <li><strong>代理路径:</strong> <code>${prefix}</code></li>
        <li><strong>代理模式:</strong> <code>${rule.type === 'path' ? '路径映射' : 'URL 参数'}</code></li>
        ${rule.target ? `<li><strong>目标源站:</strong> <code>${rule.target}</code></li>` : ''}
        <li><strong>使用示例:</strong> <pre><code>${fullExample}</code></pre></li>
      </ul>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>代理服务 - ${currentHomeDomain.replace('https://', '')}</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌐</text></svg>">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 2rem; background-color: #f7f9fc; color: #333; line-height: 1.6; }
        .container { background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 2.5rem; max-width: 800px; margin: 0 auto; border: 1px solid #e0e6ed; }
        h1 { color: #2c3e50; text-align: center; margin-bottom: 1rem; font-size: 2.2rem; border-bottom: 2px solid #e0e6ed; padding-bottom: 0.5rem; }
        h2 { color: #34495e; font-size: 1.6rem; margin-top: 2rem; margin-bottom: 1rem; }
        h3 { color: #3498db; font-size: 1.2rem; margin-top: 1.5rem; }
        p { margin-bottom: 1rem; }
        code { background-color: #e8f0fe; padding: 0.3em 0.5em; border-radius: 4px; font-family: 'SF Mono', 'Menlo', 'Consolas', monospace; font-size: 0.9em; }
        pre { background-color: #282c34; color: #abb2bf; padding: 1em 1.5em; border-radius: 8px; overflow-x: auto; font-size: 0.9em; }
        ul { list-style-type: none; padding-left: 0; }
        li { margin-bottom: 0.8em; }
        .note { background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba; padding: 1.2rem; border-radius: 8px; margin-top: 2rem; }
        .footer { text-align: center; margin-top: 3rem; border-top: 1px solid #e0e6ed; padding-top: 2rem; font-size: 0.9em; color: #7f8c8d; }
    </style>
</head>
<body>
    <div class="container">
        <h1>欢迎访问您的代理服务</h1>
        <p>此服务由 <strong>${platformName}</strong> 托管，为您提供定制化的反向代理功能。</p>
        
        <h2>🚀 代理规则列表</h2>
        ${proxyListHtml}
        
        <div class="note">
            <strong>重要提示：</strong>
            <ul>
                <li><strong>URL 参数模式:</strong> 代理路径后必须跟上完整的、在白名单内的 URL。</li>
                <li><strong>路径映射模式:</strong> 代理路径后直接跟上目标站点的文件路径即可。这是 Docker 镜像代理所使用的模式。</li>
            </ul>
        </div>

        <div class="footer">
            <p><a href="https://github.com/${GITHUB_USERNAME}/netgit" target="_blank">查看源码 on GitHub</a></p>
        </div>
    </div>
</body>
</html>
`;
};

```markdown
# 🚀 Dual Platform Proxy Service (NetGit)

[![Netlify Deploy Button](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/2476818641/netgit)
[![Cloudflare Pages Deploy Button](https://img.shields.io/badge/Deploy%20to-Cloudflare%20Pages-orange?style=flat-square&logo=cloudflare&labelColor=black)](https://github.com/new?template_name=netgit&template_owner=2476818641)

## 👋 简介

**NetGit** 是一个基于 Netlify Functions 和 Cloudflare Workers 的双平台代理服务。它旨在提供灵活、快速的代理能力，同时最大程度地简化部署和维护过程，让用户能够轻松搭建自己的代理服务。

## ✨ 主要特性

*   **⚡ 跨平台代理:** 代理逻辑同时运行在 Netlify Functions 和 Cloudflare Workers 上，提供冗余和灵活选择。
*   **🌐 静态主页:** Netlify 和 Cloudflare Pages 分别托管各自平台的主页，提供详细的使用指南和跨平台服务链接。
*   **⚙️ 共享配置:** 代理核心逻辑、白名单域名、HTML 模板等关键配置集中在 `shared/config.js` 中管理，便于统一更新和维护。
*   **🚀 一键部署:** 提供便捷的部署按钮，用户可以轻松将服务部署到自己的 Netlify 或 Cloudflare 账户，无需复杂配置。
*   **🐱 Catbox.moe 反向代理:** 安全匿名地访问 `catbox.moe` 上的图片、视频等内容，且浏览器地址栏将保持在您的域名下。
*   **🐙 GitHub & Docker 资源加速:** 特别优化对 GitHub (包括 Releases、Raw 内容、用户图像) 和 Docker (文档、Hub 资源) 相关域名的代理，有效解决这些资源访问慢的问题。
*   **📝 高度定制化:** 轻松修改白名单域名、主页内容和代理规则，打造专属服务。

## 📦 仓库结构

项目采用模块化目录结构，组织清晰：

```
├── .github/                       # GitHub Actions 配置
├── netlify/                       # Netlify 平台相关代码和配置
│   ├── functions/                 # Netlify Functions (代理逻辑)
│   ├── public/                    # 静态资产
│   ├── generate-home.js           # 主页生成脚本
│   └── netlify.toml               # Netlify 部署配置
├── pages/                         # Cloudflare Pages 平台相关代码和配置
│   ├── public/                    # 静态资产
│   ├── generate-home.js           # 主页生成脚本
└── worker/                        # Cloudflare Worker 平台相关代码和配置
│   ├── src/                       # Worker 源代码 (代理逻辑)
│   └── wrangler.toml              # Worker 部署配置
├── shared/                        # 共享配置和逻辑
│   └── config.js                  # 核心配置 (白名单、域名等)
├── package.json                   # 项目依赖
├── README.md                      # 本说明文件
└── LICENSE                        # 许可证文件
```

## 🛠️ 部署指南 (快速上手！)

部署此服务非常简单，只需点几下鼠标，无需复杂的命令行操作！

### 步骤 0：准备工作

1.  **Fork 此 GitHub 仓库:**
    *   首先，访问本仓库页面 `https://github.com/2476818641/netgit`。
    *   点击右上角的 **"Fork"** 按钮，将此仓库复制到您的 GitHub 账户下。
    *   **重要提示:** 后续部署需要从您 **Fork 后的仓库**进行。
2.  **更新 `shared/config.js`:**
    *   在您的 Fork 仓库中，找到并编辑 `shared/config.js` 文件。
    *   **确保 `GITHUB_USERNAME` 变量已设置为 `2476818641`。** 这是为了确保一键部署按钮和相关链接正确。
    *   **暂时保持 `NETLIFY_HOME_DOMAIN` 和 `CF_PAGES_HOME_DOMAIN` 的默认值。** 完成部署后，您将根据实际获得的域名更新它们。

### 步骤 1：部署到 Netlify (主页和代理函数)

Netlify 提供便捷的 Git 集成部署体验。

1.  **点击一键部署按钮:**
    [![Netlify Deploy Button](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/$YOUR_GITHUB_USERNAME$/netgit)
    > **注意：** 点击此按钮时请确保使用您 Fork 的仓库链接，或者如果通过本仓库链接部署，Netlify 会提示您选择。
2.  **授权并选择仓库:**
    *   登录您的 Netlify 账户 (如果没有，可以免费注册)。
    *   Netlify 会引导您连接 GitHub。授权后，选择您 Fork 的 `netgit` 仓库。
3.  **配置构建设置:**
    检查并手动填写以下设置：
    *   **Base directory (基本目录):** `netlify/`
    *   **Build command (构建命令):** `npm install --prefix netlify && npm run build --prefix netlify`
    *   **Publish directory (发布目录):** `netlify/build`
    *   **Functions directory (函数目录):** `netlify/functions`
4.  **开始部署:**
    *   点击 **"Deploy site"**。Netlify 将自动拉取您的代码，安装依赖，构建项目并部署函数。
5.  **获取 Netlify 域名:**
    *   部署成功后，Netlify 会提供一个默认域名（例如 `your-awesome-site-xxxx.netlify.app`）。**请记下此域名。**
    *   **可选:** 您可以在 Netlify 项目设置中绑定自己的自定义域名（例如 `plp.liudds.eu.org`）。

### 步骤 2：部署到 Cloudflare Pages (主页)

Cloudflare Pages 将用于托管您的 Cloudflare 代理服务的主页。

1.  **点击一键部署按钮:**
    [![Cloudflare Pages Deploy Button](https://img.shields.io/badge/Deploy%20to-Cloudflare%20Pages-orange?style=flat-square&logo=cloudflare&labelColor=black)](https://github.com/new?template_name=netgit&template_owner=2476818641)
    > **注意：** 此按钮将使用本仓库作为模板创建一个新仓库。创建后，您需要前往 Cloudflare Pages 仪表板连接该新仓库。
    *   或者直接访问 [Cloudflare Pages 仪表板](https://dash.cloudflare.com/?to=/:account/pages)。
2.  **创建应用程序并连接 GitHub:**
    *   登录您的 Cloudflare 账户，进入 "Workers & Pages" -> "Pages"。
    *   点击 **"Create application"**。
    *   选择 **"Connect to Git"**，然后连接您的 GitHub 账户并选择您 Fork 的 `netgit` 仓库（或从模板创建的新仓库）。
3.  **配置构建设置:**
    *   **Project name (项目名称):** 填写一个您喜欢的名称，例如 `netgit-homepage`。
    *   **Production branch (生产分支):** 通常是 `main` 或 `master`。
    *   **Build command (构建命令):** `npm install --prefix pages && npm run build --prefix pages`
    *   **Build output directory (构建输出目录):** `build`
    *   **Root directory (根目录):** `pages/`
4.  **开始部署:**
    *   点击 **"Save and Deploy"**。Cloudflare Pages 将自动拉取代码，构建并部署您的主页。
5.  **获取 Cloudflare Pages 域名:**
    *   部署成功后，您会得到一个 `.pages.dev` 域名（例如 `netgit-homepage.pages.dev`）。**请记下此域名。**
    *   **可选:** 您可以在 Pages 项目设置中绑定自己的自定义域名（例如 `cf.liudds.eu.org`）。这个域名将是您 Cloudflare 代理服务的主入口。

### 步骤 3：部署到 Cloudflare Workers (代理功能)

这是提供实际代理功能的 Cloudflare Worker。

1.  **重要：更新实际域名！**
    *   现在您已经获得了 Netlify 和 Cloudflare Pages 的实际域名。
    *   回到您的 GitHub Fork 仓库中，编辑 `shared/config.js` 文件。
    *   将 `NETLIFY_HOME_DOMAIN` 变量更新为你在 **步骤 1** 中获得的 Netlify 实际域名（例如 `https://your-awesome-site-xxxx.netlify.app` 或 `https://plp.liudds.eu.org`）。
    *   将 `CF_PAGES_HOME_DOMAIN` 变量更新为你在 **步骤 2** 中获得的 Cloudflare Pages 实际域名（例如 `https://netgit-homepage.pages.dev` 或 `https://cf.liudds.eu.org`）。
    *   **提交这次修改并推送到 GitHub。** 这将确保 Worker 的重定向链接和两个平台主页上的切换链接是正确的。

2.  **安装 `wrangler` CLI:** (如果您的开发环境还没有 Node.js 和 npm，请先安装)
    *   打开 **命令行终端**。
    *   运行命令安装 `wrangler`：
        ```bash
        npm install -g wrangler
        ```

3.  **登录 Cloudflare:**
    *   在终端中运行：
        ```bash
        wrangler login
        ```
    *   这会打开一个浏览器窗口，引导您登录 Cloudflare 并授权 `wrangler` 访问您的账户。

4.  **进入 Worker 目录:**
    *   在终端中，导航到您本地 `netgit` 仓库的 `worker` 目录：
        ```bash
        cd path/to/your/netgit/worker  # 替换为您的实际路径，例如：cd C:\Users\YourUser\Documents\netgit\worker
        ```

5.  **发布 Worker:**
    *   在 `worker` 目录下运行以下命令发布 Worker：
        ```bash
        wrangler publish --name netgit-worker --main src/proxy-worker.js --compatibility-date 2023-11-20 --minify
        ```
    *   `--name netgit-worker` 可以替换为您喜欢的 Worker 名称。`--compatibility-date` 建议使用最新日期，具体请查阅 Cloudflare Workers 官方文档。

6.  **绑定域名和路由 (Cloudflare 仪表板手动操作 - 最关键一步！):**
    *   登录 [Cloudflare 仪表板](https://dash.cloudflare.com/)。
    *   进入您的域名管理页面 (例如 `example.com`)。
    *   点击左侧导航栏的 **"Workers & Pages"** -> **"Overview"**。
    *   找到并点击您刚刚发布的 Worker (`netgit-worker`)。
    *   进入 **"Triggers"** 选项卡。
    *   点击 **"Add route"**，然后重复以下步骤添加所有需要的代理路由：
        *   **Route (路径模式):** 填写您的 Cloudflare Pages 域名（例如 `cf.liudds.eu.org`），后面跟上代理路径：
            *   `cf.liudds.eu.org/git/*` （用于 GitHub 代理）
            *   `cf.liudds.eu.org/docker/*` （用于 Docker 代理）
            *   `cf.liudds.eu.org/catbox/*` （用于 Catbox 代理）
            *   **注意：请替换 `cf.liudds.eu.org` 为您在 `步骤 2` 中获得的或绑定的 Pages 实际域名。**
        *   **Zone (区域):** 选择您的域名 (例如 `liudds.eu.org`)。
        *   **Service (服务):** 选择 `netgit-worker`。
        *   **Environment (环境):** 选择 `production`。
    *   **再次强调：** **请勿为 `cf.liudds.eu.org/` 或 `cf.liudds.eu.org` 这样的根路径绑定 Worker！** 根路径应由 Cloudflare Pages 处理，以显示您的静态主页。

7.  **DNS 配置 (Cloudflare 仪表板手动操作):**
    *   进入您的域名的 DNS 设置 (`example.com` -> "DNS" -> "Records")。
    *   确保您的自定义域名（例如 `cf.liudds.eu.org`）有一个 **CNAME 记录**，指向您在 `步骤 2` 中获得的 Cloudflare Pages 默认域名（例如 `netgit-homepage.pages.dev`）。这个 CNAME 记录确保当用户访问 `https://cf.liudds.eu.org` 时，显示 Pages 部署的静态主页。Worker 的路由会精确地捕获其定义的代理路径（如 `/git/*`）。

## ✅ 测试您的服务

当两个平台的部署都完成后，是时候测试一下了！

1.  **访问您的 Netlify 主页:**
    *   在浏览器中输入您的 Netlify 域名（例如 `https://your-awesome-site-xxxx.netlify.app` 或 `https://plp.liudds.eu.org`）。
    *   应该能看到 Netlify 版本的代理服务主页，其中包含使用说明和示例。
    *   **测试 Netlify 代理功能:**
        *   GitHub 代理示例: `https://plp.liudds.eu.org/git/https://github.com/louislam/uptime-kuma/archive/refs/tags/2.0.2.zip`
        *   Catbox 代理示例: `https://plp.liudds.eu.org/catbox/images/logo.png`

2.  **访问您的 Cloudflare Pages 主页:**
    *   在浏览器中输入您的 Cloudflare Pages 域名（例如 `https://netgit-homepage.pages.dev` 或 `https://cf.liudds.eu.org`）。
    *   应该能看到 Cloudflare Pages 版本的代理服务主页，同样包含说明和示例。
    *   **测试 Cloudflare Worker 代理功能:**
        *   GitHub 代理示例: `https://cf.liudds.eu.org/git/https://github.com/louislam/uptime-kuma/archive/refs/tags/2.0.2.zip`
        *   Catbox 代理示例: `https://cf.liudds.eu.org/catbox/images/logo.png`

如果一切顺利，您将成功拥有一个双平台代理加速服务！🎉

---

## 💡 常见问题与维护

### 1. 为什么我的代理不能工作？

*   **检查域名配置:** 确保 `shared/config.js` 中的 `NETLIFY_HOME_DOMAIN` 和 `CF_PAGES_HOME_DOMAIN` 已更新为您的**实际部署域名**。
*   **Cloudflare Worker 路由:** 仔细检查 Cloudflare 仪表板中 Worker 的路由绑定是否正确（路径、区域、服务）。特别是，确保使用了正确的域名作为路由的前缀，且没有与 Pages 的根路径冲突。
*   **URL 格式:** 确保在代理路径 (例如 `/git/` 或 `/catbox/`) 后面的目标 URL 是 **完整且正确的** (包含 `http://` 或 `https://`)。
*   **白名单:** 目标网站的域名是否在 `shared/config.js` 的白名单中？如果不在，你需要将其添加。
*   **错误日志:** 检查 Netlify 函数日志或 Cloudflare Worker 日志，通常能提供错误详情。

### 2. 如何更新代理规则或主页内容？

*   **修改 `shared/config.js`:** 需要更改白名单域名、修改主页模板内容或更新平台域名时，只需编辑此文件。
*   **更新后部署:**
    *   对于 Netlify 和 Cloudflare Pages，只需将修改后的 `shared/config.js` 推送到您的 GitHub 仓库 `main` 分支，它们会自动触发重新构建和部署。
    *   对于 Cloudflare Worker，您需要再次使用 `wrangler publish` 命令手动发布：
        ```bash
        cd netgit/worker
        wrangler publish --name netgit-worker # 确保名称一致
        ```

### 3. 如何添加新的代理路径或功能？

1.  **更新 `shared/config.js`:** 定义新的代理路径常量和任何相关的白名单域名。
2.  **修改 `netlify/functions/proxy.js`:** 添加 `else if` 分支来处理新的代理路径和逻辑。
3.  **修改 `worker/src/proxy-worker.js`:** 同样添加 `else if` 分支来处理新的代理路径和逻辑。
4.  **修改 `netlify/netlify.toml`:** 添加新的 `[[redirects]]` 规则，将新路径指向 Netlify Function。
5.  **在 Cloudflare 仪表板添加 Worker 路由:** 为新的代理路径绑定 Worker 路由。
6.  **更新 `generate-home.js` (可选):** 如果需要在主页中展示新功能的说明和示例，请修改 `netlify/generate-home.js` 和 `pages/generate-home.js`。

---

## 许可证

本项目基于 MIT 许可证发布。详情请查看仓库根目录下的 `LICENSE` 文件。

---

## 🙏 贡献

欢迎任何形式的贡献！如果您有改进意见、发现 bug 或希望添加新功能，请随时提交 [Issue](https://github.com/2476818641/netgit/issues) 或 [Pull Request](https://github.com/2476818641/netgit/pulls)。您的支持是我前进的动力！
```
# NetGit - 双平台通用代理服务 🚀

[![一键部署到 Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/2476818641/netgit)
[![一键部署到 Cloudflare Pages](https://static.cloudflareinsights.com/pages/media/deploy-with-cloudflare-pages.svg)](https://deploy.workers.cloudflare.com/?url=https%3A%F%2Fgithub.com%2F2476818641%2Fnetgit)

**NetGit** 是一个基于 Netlify 和 Cloudflare Pages Functions 的双平台通用代理服务。它旨在提供灵活、快速的代理能力，并最大程度地简化部署流程，让您能轻松拥有自己的专属代理。

---

## ✨ 主要特性

*   **⚡ 双平台部署:** 同时支持 Netlify 和 Cloudflare，您可以根据自己的偏好和网络环境自由选择。
*   **💨 极简部署:** 无需 `wrangler` CLI，无需手动配置路由。只需在平台点击几下，即可同时部署静态主页和代理服务。
*   **🔧 配置中心化:** 所有关键配置（如代理白名单、域名等）都集中在 `shared/config.js` 文件中，方便统一管理和维护。
*   **🚀 一键部署:** 提供便捷的部署按钮，让您在几分钟内完成服务的上线。
*   **🎯 多功能代理:**
    *   **GitHub & Docker:** 解决部分网络环境下访问 GitHub (raw, release) 和 Docker (registry) 资源缓慢或失败的问题。
    *   **Catbox.moe:** 安全、匿名地反向代理 `catbox.moe` 上的内容。

---

## 🛠️ 部署指南

整个部署过程分为三个核心步骤，请务必按顺序操作。

### 步骤 1：准备工作 (Fork & 修改初始配置)

这是所有后续部署的基础。

1.  **Fork 本仓库**
    点击此页面右上角的 **"Fork"** 按钮，将此项目完整地复制到您自己的 GitHub 账户下。

2.  **修改 `shared/config.js`**
    在您 Fork 后的仓库中，找到并编辑 `shared/config.js` 文件，将 `GITHUB_USERNAME` 的值修改为您自己的 GitHub 用户名。

    ```javascript
    // shared/config.js
    export const GITHUB_USERNAME = "你的GitHub用户名"; // 务必替换这里
    ```
    > **注意：** `NETLIFY_HOME_DOMAIN` 和 `CF_PAGES_HOME_DOMAIN` 这两个变量请暂时留空，等待部署成功获得域名后再回来修改。

### 步骤 2：选择平台并部署

您可以只部署一个，也可以两个都部署。**推荐使用 Cloudflare Pages**，因为它流程最简单。

#### A. 部署到 Cloudflare Pages (推荐)

此方式只需一次部署即可同时拥有主页和代理功能。

1.  登录 Cloudflare 仪表板，进入 **Workers & Pages**。
2.  点击 **"创建应用程序"** -> **"Pages"** -> **"连接到 Git"**。
3.  选择您刚刚 Fork 的 `netgit` 仓库。
4.  在 **“构建和部署”** 设置页面，**精确填写**以下信息：
    *   **项目名称:** 任意填写 (例如 `my-netgit`)
    *   **生产分支:** `main`
    *   **框架预设:** `None`
    *   **根目录:** `/pages`
    *   **构建命令:** `npm install && npm run build`
    *   **构建输出目录:** `build`
5.  点击 **“保存并部署”**。部署成功后，您会得到一个 `.pages.dev` 域名。

#### B. 部署到 Netlify (可选)

1.  点击仓库顶部的 **"Deploy to Netlify"** 按钮。
2.  登录并授权后，Netlify 会自动识别配置。请确认以下信息是否正确：
    *   **Base directory:** `netlify`
    *   **Build command:** `cd netlify && npm install && npm run build`
    *   **Publish directory:** `netlify/build`
3.  点击 **"Deploy site"**。部署成功后，您会得到一个 `.netlify.app` 的域名。

### 步骤 3：更新最终域名 (关键)

这是确保主页链接正常工作的**最后一步**。

1.  回到您 Fork 的 GitHub 仓库，再次打开 `shared/config.js` 文件。
2.  将 `CF_PAGES_HOME_DOMAIN` 和 `NETLIFY_HOME_DOMAIN` 的值更新为您刚刚获得的**完整域名**。

    ```javascript
    // shared/config.js
    export const GITHUB_USERNAME = "你的GitHub用户名"; // 这个应该已经修改过了
    export const CF_PAGES_HOME_DOMAIN = "https://my-netgit.pages.dev"; // 替换为你的 Cloudflare 域名
    export const NETLIFY_HOME_DOMAIN = "https://my-netlify-site.netlify.app"; // 替换为你的 Netlify 域名
    ```
3.  提交并推送这次修改。平台会自动重新部署，之后您的主页和所有功能将完全正常。

---

## ✅ 如何使用

部署完成后，将 `<你的域名>` 替换为您的 Cloudflare 或 Netlify 服务的实际域名即可使用。

*   **GitHub 代理:** `<你的域名>/ghproxy/https://github.com/owner/repo/archive/main.zip`
*   **Docker 代理:** `<你的域名>/dockerproxy/https://registry-1.docker.io/v2/`
*   **Catbox 代理:** `<你的域名>/catbox/some_file.jpg`

---
## 📂 项目结构
```text
.
├── netlify/                   # Netlify 平台相关代码
├── pages/                     # Cloudflare Pages 平台相关代码
├── shared/                    # 共享配置 (核心)
└── worker/                    # (参考) 独立 Worker 逻辑
```
---

## 💡 常见问题

*   **Cloudflare 代理不工作怎么办？**
    请仔细检查 **步骤 2A** 中的构建设置是否完全正确，尤其是 **根目录** 必须是 `/pages`。

*   **如何更新代理规则或白名单？**
    直接修改 `shared/config.js` 文件，然后提交并推送到您的 GitHub `main` 分支即可。平台会自动重新部署。

## 🤝 贡献

欢迎任何形式的贡献！如果您有改进意见、发现 bug 或希望添加新功能，请随时提交 [Issue](https://github.com/2476818641/netgit/issues) 或 [Pull Request](https://github.com/2476818641/netgit/pulls)。

## 📜 许可证

本项目基于 [MIT](LICENSE) 许可证发布。
```

### 主要优化点：

1.  **简化标题和描述**：对特性描述进行了微调，使其更具吸引力且易于理解。
2.  **重构部署指南**：
    *   将原来的 "第〇、一、二、三步" 改为逻辑更清晰的 "步骤 1、2、3"，并为每个步骤赋予了明确的标题（如 "准备工作"、"选择平台并部署"、"更新最终域名"）。
    *   使用 `A.` 和 `B.` 来区分 Cloudflare 和 Netlify 的部署，并明确标出 **"(推荐)"**，为用户提供决策参考。
    *   在关键配置处（如 Cloudflare 的构建设置）使用了 **"精确填写"** 等加重语气的词，提醒用户注意细节。
    *   在最后一步明确指出其为 **"(关键)"**，并解释了这样做的目的，增加了用户操作的动力。
3.  **突出重点**：
    *   大量使用 **粗体** 来突出关键的配置项、文件名和注意事项，帮助用户在快速浏览时也能抓住重点。
    *   使用引用块 `>` 来强调提示信息，使其在视觉上与正文分离。
4.  **调整章节顺序**：将相对次要的 "项目结构" 移动到了 "如何使用" 之后，让核心的部署和使用指南能够更早地呈现给用户。
5.  **精简内容**：对一些语句进行了优化，使其更加精炼，例如将 `FAQ` 中的问题组织得更像一个快速问答。

这个版本保留了您所有详尽的信息，但在排版和引导性上做了增强，希望能让用户体验更加流畅。

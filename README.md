# NetGit - 双平台通用代理服务 🚀

[![一键部署到 Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/2476818641/netgit)

**NetGit** 是一个基于 Cloudflare Pages 和 Netlify Functions 的双平台通用代理服务。它旨在提供灵活、快速的代理能力，并最大程度地简化部署流程，让您能轻松拥有自己的专属代理。

---

## ✨ 主要特性

*   **⚡ 双平台部署:** 同时支持 Cloudflare Pages 和 Netlify，您可以根据自己的偏好和网络环境自由选择。
*   **💨 可靠部署:** 提供清晰的手动部署指南，确保在复杂的项目结构下也能 100% 成功部署。
*   **🔧 配置中心化:** 所有关键配置（如代理白名单、域名等）都集中在 `shared/config.js` 文件中，方便统一管理和维护。
*   **🎯 多功能代理:**
    *   **GitHub & Docker:** 解决部分网络环境下访问 GitHub (raw, release) 和 Docker (registry) 资源缓慢或失败的问题。
    *   **Catbox.moe:** 安全、匿名地反向代理 `catbox.moe` 上的内容。

---

## 🛠️ 部署指南

整个部署过程分为三个核心步骤，请务必按顺序操作。

### 步骤 1：准备工作 (Fork & 修改初始配置)

这是所有后续部署的基础，请务必完成。

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

我们推荐使用 Cloudflare Pages，因为它性能更优且功能更全。

#### A. 部署到 Cloudflare Pages (推荐)

由于本项目结构特殊，需要通过 Cloudflare 控制台手动设置才能确保成功。

1.  登录 Cloudflare 仪表板，进入 **Workers & Pages**。
2.  点击 **"创建应用程序"** -> **"Pages"** -> **"连接到 Git"**。
3.  选择您刚刚 Fork 的 `netgit` 仓库。
4.  在 **“设置构建和部署”** 页面，**请精确填写**以下信息：
    *   **项目名称:** 任意填写 (例如 `my-netgit`)
    *   **生产分支:** `main`
    *   **框架预设:** `None`
    *   **构建命令:** `npm install && npm run build`
    *   **构建输出目录:** `build`
    *   **根目录 (Root directory):** `/pages`  **<-- ⚠️ 这是最关键的一步！**
5.  点击 **“保存并部署”**。部署成功后，您会得到一个 `.pages.dev` 域名。

#### B. 部署到 Netlify (备选方案)

1.  点击本页面顶部的 **"Deploy to Netlify"** 蓝色按钮。
2.  登录并授权后，Netlify 会自动识别配置。**请检查并确认**以下信息是否正确：
    *   **Base directory:** `netlify`
    *   **Build command:** `npm install && npm run build`
    *   **Publish directory:** `build`
3.  点击 **"Deploy site"**。部署成功后，您会得到一个 `.netlify.app` 的域名。

### 步骤 3：更新最终域名 (⚠️ 关键)

这是确保主页链接和功能正常工作的**最后一步**，请勿跳过！

1.  回到您 Fork 的 GitHub 仓库，再次打开 `shared/config.js` 文件。
2.  将 `CF_PAGES_HOME_DOMAIN` 和 `NETLIFY_HOME_DOMAIN` 的值更新为您刚刚获得的**完整域名**（如果只部署了一个平台，另一个留空即可）。

    ```javascript
    // shared/config.js
    export const GITHUB_USERNAME = "你的GitHub用户名"; // 这个应该已经修改过了
    export const CF_PAGES_HOME_DOMAIN = "https://my-netgit.pages.dev"; // 替换为你的 Cloudflare 域名
    export const NETLIFY_HOME_DOMAIN = "https://my-netlify-site.netlify.app"; // 替换为你的 Netlify 域名
    ```
3.  提交并推送这次修改。平台会自动触发一次新的部署，部署完成后，您的主页和所有功能将完全正常。

---

## ✅ 如何使用

部署完成后，将 `<你的域名>` 替换为您的 Cloudflare 或 Netlify 服务的实际域名即可使用。

*   **GitHub 代理:** `<你的域名>/ghproxy/https://github.com/owner/repo/archive/main.zip`
*   **Docker 代理:** `<你的域名>/dockerproxy/镜像地址`
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
    请仔细检查并确保 **步骤 2A** 中的构建设置完全正确，尤其是 **根目录** 必须是 `/pages`。任何一项错误都可能导致部署失败。

*   **如何更新代理规则或白名单？**
    直接修改 `shared/config.js` 文件，然后提交并推送到您的 GitHub `main` 分支即可。平台会自动重新部署。

## 🤝 贡献

欢迎任何形式的贡献！如果您有改进意见、发现 bug 或希望添加新功能，请随时提交 [Issue](https://github.com/2476818641/netgit/issues) 或 [Pull Request](https://github.com/2476818641/netgit/pulls)。

## 📜 许可证

本项目基于 [MIT](LICENSE) 许可证发布。
```

这个版本非常清晰，能有效引导用户完成部署，你做的决策是完全正确的。

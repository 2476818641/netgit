```markdown
# 🚀 NetGit - 双平台通用代理服务

[![一键部署到 Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/2476818641/netgit)
[![一键部署到 Cloudflare Pages](https://static.cloudflareinsights.com/pages/media/deploy-with-cloudflare-pages.svg)](https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2F2476818641%2Fnetgit)

一个基于 Netlify 和 Cloudflare 的双平台通用代理服务，旨在解决特定资源的访问问题，并提供一键部署的便捷体验。

---

## 🚀 快速部署

只需三步，即可拥有您自己的代理服务：

1.  **Fork 本仓库**
    点击页面右上角的 **Fork** 按钮，将项目复制到您自己的 GitHub 账户。

2.  **一键部署**
    点击上方的 **Deploy to Netlify** 或 **Deploy to Cloudflare Pages** 按钮，并根据平台提示完成授权和设置。
    > **提示:** 部署 Cloudflare Pages 时，如果需要手动填写构建信息，请使用以下设置：
    > *   **根目录:** `/pages`
    > *   **构建命令:** `npm install && npm run build`
    > *   **构建输出目录:** `build`

3.  **更新域名配置 (部署后)**
    部署成功后，您会得到一个专属域名。请编辑您仓库中的 `shared/config.js` 文件，将 `NETLIFY_HOME_DOMAIN` 和 `CF_PAGES_HOME_DOMAIN` 的值更新为您的实际域名。这能确保主页上的链接正确无误。

---

## ✅ 如何使用

部署成功后，将下方示例中的 `<你的域名>` 替换为您的 Netlify 或 Cloudflare 域名即可使用。

*   **GitHub 代理** (用于加速 Releases, Raw 文件等)
    ```
    <你的域名>/ghproxy/https://github.com/owner/repo/archive/main.zip
    ```

*   **Docker 代理** (用于加速镜像相关资源)
    ```
    <你的域名>/dockerproxy/https://registry-1.docker.io/v2/
    ```

*   **Catbox 代理** (用于反代 `catbox.moe` 资源)
    ```
    <你的域名>/catbox/some_file.jpg
    ```

---

## 📜 许可证

本项目基于 [MIT](LICENSE) 许可证发布。
```

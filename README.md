```markdown
# NetGit - 双平台通用代理服务 🚀

[![一键部署到 Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/2476818641/netgit)
[![一键部署到 Cloudflare Pages](https://static.cloudflareinsights.com/pages/media/deploy-with-cloudflare-pages.svg)](https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2F2476818641%2Fnetgit)

**NetGit** 是一个基于 Netlify 和 Cloudflare Pages 构建的双平台通用代理服务，旨在解决特定网络资源的访问问题，并提供极致便捷的一键部署体验。

---

## ✨ 功能特性

*   **双平台支持:** 可在 Netlify 和 Cloudflare Pages 上自由选择部署。
*   **一键部署:** 无需复杂的配置，点击按钮即可快速部署。
*   **多服务代理:** 内置支持 GitHub, Docker Hub, Catbox 等多种资源的代理。
*   **高度可定制:** 您可以轻松 Fork 并根据自己的需求进行修改。

---

## 🚀 快速开始

只需三个简单的步骤，即可拥有您自己的全功能代理服务。

### 1. Fork 本项目

点击仓库页面右上角的 **Fork** 按钮，将此项目复制到您自己的 GitHub 账户下。

### 2. 一键部署

在您 Fork 后的仓库页面，点击下方的按钮以部署到您选择的平台：

*   **部署到 Netlify:**
    [![一键部署到 Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/2476818641/netgit)

*   **部署到 Cloudflare Pages:**
    [![一键部署到 Cloudflare Pages](https://static.cloudflareinsights.com/pages/media/deploy-with-cloudflare-pages.svg)](https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2F2476818641%2Fnetgit)

> **📝 Cloudflare Pages 构建设置提示:**
> 如果平台未能自动识别配置，请手动填写以下信息：
> *   **框架预设 (Framework preset):** `None`
> *   **构建命令 (Build command):** `npm install && npm run build`
> *   **构建输出目录 (Build output directory):** `/build`
> *   **根目录 (Root directory):** `/pages`

### 3. 更新域名配置（部署后）

部署成功后，平台会为您分配一个专属域名（例如 `your-project.netlify.app` 或 `your-project.pages.dev`）。

请编辑您仓库中的 `shared/config.js` 文件，将 `NETLIFY_HOME_DOMAIN` 和 `CF_PAGES_HOME_DOMAIN` 的值更新为您的实际域名。这一步能确保项目主页上的链接和功能正常工作。

```javascript
// shared/config.js

export const NETLIFY_HOME_DOMAIN = 'your-project.netlify.app'; // 替换成您的 Netlify 域名
export const CF_PAGES_HOME_DOMAIN = 'your-project.pages.dev';   // 替换成您的 Cloudflare 域名
```

---

## 💡 如何使用

部署并配置完成后，将下方示例中的 `<你的域名>` 替换为您的 Netlify 或 Cloudflare 域名即可开始使用。

### GitHub 代理

用于加速 GitHub Releases、Raw 文件、代码压缩包等的下载。

**格式:** `<你的域名>/ghproxy/<GitHub 资源链接>`

**示例:**
```
# 加速下载 release 文件
<你的域名>/ghproxy/https://github.com/owner/repo/releases/download/v1.0/asset.zip

# 加速下载源码压缩包
<你的域名>/ghproxy/https://github.com/owner/repo/archive/main.zip
```

### Docker 代理

用于加速 Docker Hub 相关资源的访问。

**格式:** `<你的域名>/dockerproxy/<Docker Hub API 链接>`

**示例:**
```
# 拉取镜像（示例）
<你的域名>/dockerproxy/https://registry-1.docker.io/v2/library/hello-world/manifests/latest
```

### Catbox 代理

用于反向代理 `catbox.moe` 上的资源。

**格式:** `<你的域名>/catbox/<文件名>`

**示例:**
```<你的域名>/catbox/some_file.jpg
```

---

## 📜 许可证

本项目基于 [MIT](LICENSE) 许可证发布。欢迎 Fork、使用和分享！
```

### 主要修改点：

1.  **标题和简介优化**：在标题后添加了 Emoji (🚀) 使其更醒目，并用更具吸引力的语言重写了项目简介。
2.  **增加“功能特性”部分**：提炼了项目的核心优点，让用户能快速了解项目能做什么。
3.  **优化“快速开始”步骤**：
    *   使用了二级标题（H3），使步骤更加清晰。
    *   将部署按钮直接放在了对应的步骤下方，引导用户操作。
    *   对 Cloudflare 的构建设置提示使用了引用块和代码高亮，使其更易于阅读和复制。
    *   在“更新域名配置”部分，直接给出了代码示例，并用注释标明了需要修改的地方，降低了用户的理解成本。
4.  **优化“如何使用”部分**：
    *   为每个代理功能都提供了清晰的“格式”和“示例”，让用户可以轻松地举一反三。
    *   使用了代码块来展示示例 URL，格式更规范。
5.  **结构和分隔符**：使用了更多的水平分割线 (`---`) 来清晰地划分不同区域，使整个文档的结构感更强。
6.  **许可证说明**：在末尾对许可证部分稍作补充，增加了欢迎使用的友好提示。

这个版本在保留您所有原始信息的基础上，通过格式化和内容补充，使其更加专业和用户友好，符合 GitHub 上优秀开源项目的 `README.md` 风格。

# NetGit - 开源双平台代理服务

🚀 功能全面的代理服务，支持 GitHub、Docker Hub、NPM、PyPI 等多种资源访问，集成健康检查和历史数据统计。

[![部署状态](https://img.shields.io/badge/部署-Cloudflare%20Pages-orange)](https://cf.liuass.eu.org)
[![版本](https://img.shields.io/badge/版本-v1.2.0-blue)](https://github.com/2476818641/netgit)

## ✨ 核心功能

### 📦 代理服务（16个规则）

**代码托管平台**
- `/ghproxy/` - GitHub 资源代理
- `/gitlab/` - GitLab 资源代理
- `/` - 通用 URL 代理（支持多域名白名单）

**容器镜像仓库**
- `/dockerproxy/` - Docker Hub
- `/gcr/` - Google Container Registry
- `/quay/` - Quay.io
- `/ghcr/` - GitHub Container Registry

**包管理器**
- `/npm/` - NPM 包注册表
- `/pypi/` - PyPI Python 包
- `/maven/` - Maven Central 仓库

**CDN 资源**
- `/jsdelivr/` - jsDelivr CDN
- `/unpkg/` - Unpkg CDN

**文件托管**
- `/imgur/` - Imgur 图片
- `/catbox/` - Catbox.moe 文件

**其他**
- `/ssh/` - SSH 透明代理（Host 模式）

### 🏥 健康检查系统

**双格式输出**
- `/health` - 美观的 HTML 页面，实时状态展示
- `/health/json` - 纯 JSON 格式，适合脚本监控

**实时监控（8个目标）**
- GitHub API & Raw CDN
- GitLab
- Docker Hub Registry
- NPM Registry
- PyPI
- jsDelivr CDN
- Unpkg CDN

**30天历史统计**
- 平均延迟计算
- 服务可用率统计
- 自动数据汇总
- KV 存储支持（30天 TTL）

**定时检查**
- 每 30 分钟自动执行
- Workers Cron Triggers
- 自动保存到 KV

## 🚀 快速开始

### 使用示例

```bash
# GitHub 文件代理
curl https://cf.liuass.eu.org/raw.githubusercontent.com/torvalds/linux/master/README

# NPM 包查询
curl https://cf.liuass.eu.org/npm/vue

# Docker Hub 镜像
docker pull cf.liuass.eu.org/dockerproxy/library/nginx:latest

# jsDelivr CDN
curl https://cf.liuass.eu.org/jsdelivr/npm/vue@3/dist/vue.global.js

# 健康检查
curl https://cf.liuass.eu.org/health/json
```

## 📊 部署架构

### 支持的平台

- ✅ **Cloudflare Pages** - 主推荐（支持 KV + Cron）
- ✅ **Netlify** - 备选方案
- ✅ **Vercel** - 备选方案

### Cloudflare Pages 部署

#### 1. 创建 KV 命名空间

```bash
# 在 Cloudflare Dashboard 中创建 KV 命名空间
# Workers & Pages > KV > Create a namespace
# 命名为：netgit-health-data
```

#### 2. 配置环境变量

在 Cloudflare Pages 设置中：
- 变量名：`KV`
- 值：选择你创建的 KV 命名空间

#### 3. 配置 Cron Triggers

在 `wrangler.toml` 中已配置：
```toml
[triggers]
crons = ["*/30 * * * *"]  # 每30分钟执行
```

部署后会自动启用定时任务。

#### 4. 推送部署

```bash
git push origin main
```

Cloudflare Pages 会自动构建和部署。

## 🛠️ 本地开发

### 环境要求

- Node.js 16+
- Git

### 安装依赖

```bash
# 主项目（可选）
npm install

# Cloudflare Pages
cd pages && npm install

# Netlify
cd netlify && npm install

# Vercel
cd vercel && npm install
```

### 本地测试

```bash
# 构建所有平台
cd pages && npm run build
cd ../netlify && npm run build
cd ../vercel && npm run build

# 使用 Wrangler 本地测试（Cloudflare）
npx wrangler pages dev pages/build --kv KV
```

## 📖 配置说明

### 修改代理规则

编辑 `shared/config.js`：

```javascript
export const proxyRules = {
  '/your-path/': {
    type: 'path',  // 'path' | 'url' | 'host' | 'health'
    target: 'https://your-target.com',
    description: '你的代理描述',
    examplePath: 'api/data'
  }
};
```

### 添加健康检查目标

编辑 `shared/health-checker.js`：

```javascript
export const healthCheckTargets = [
  { 
    name: 'Your Service', 
    url: 'https://your-service.com/api', 
    type: 'api' // 'api' | 'cdn' | 'registry'
  }
];
```

### 调整定时频率

编辑 `wrangler.toml`：

```toml
[triggers]
crons = ["0 * * * *"]  # 改为每小时
```

## 📈 性能优化

- ✅ Cloudflare CDN 缓存
- ✅ Workers KV 高速存储
- ✅ 智能路径匹配（长路径优先）
- ✅ 响应头优化
- ✅ 30 天数据自动过期

## 🎨 UI 特性

- ✅ 深色/浅色模式切换
- ✅ 一键复制示例
- ✅ 响应式设计
- ✅ 彩色状态标签
- ✅ 实时延迟显示
- ✅ 30天趋势对比

## 📝 API 响应格式

### `/health/json` 响应示例

```json
{
  "status": "healthy",
  "timestamp": "2026-07-01T06:00:00.000Z",
  "version": "1.2.0",
  "checks": {
    "targets": [
      {
        "name": "GitHub",
        "type": "api",
        "latency": 136,
        "status": "healthy",
        "statusCode": 200,
        "available": true
      }
    ],
    "summary": {
      "total": 8,
      "healthy": 7,
      "degraded": 1,
      "unhealthy": 0
    }
  },
  "stats30d": {
    "period": "30d",
    "summary": {
      "totalChecks": 1440,
      "daysWithData": 30
    },
    "targets": {
      "GitHub": {
        "avgLatency": 145,
        "availability": "99.85",
        "healthyCount": 1430,
        "degradedCount": 8,
        "unhealthyCount": 2
      }
    }
  }
}
```

## 🔒 安全性

- ✅ 域名白名单验证
- ✅ 请求头过滤
- ✅ 超时保护（5秒）
- ✅ 错误处理机制
- ✅ 无敏感信息暴露

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [GitHub 仓库](https://github.com/2476818641/netgit)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Workers KV 文档](https://developers.cloudflare.com/kv/)
- [Cron Triggers 文档](https://developers.cloudflare.com/workers/configuration/cron-triggers/)

---

⭐ 如果这个项目对你有帮助，请给一个 Star！

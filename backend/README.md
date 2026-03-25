# AI项目后端服务

为AI前端项目提供认证、GitHub OAuth代理和API服务的后端应用。

## 🚀 快速开始

### 环境要求

- Node.js 18+ 或 20+
- npm 或 yarn

### 安装依赖

```bash
cd backend
npm install
```

### 环境配置

1. 复制环境变量示例文件：

```bash
cp .env.example .env
```

1. 编辑 `.env` 文件，配置以下必需项：

```env
# GitHub OAuth 配置（必需）
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:5173/auth/github/callback

# JWT 配置
JWT_SECRET=your_jwt_secret_key_here_change_this_to_a_secure_random_string

# 前端URL（用于CORS）
FRONTEND_URL=http://localhost:5173
```

### 获取GitHub OAuth凭据

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写以下信息：
   - **Application name**: AI Frontend Dashboard
   - **Homepage URL**: <http://localhost:5173>
   - **Authorization callback URL**: <http://localhost:5173/auth/github/callback>
4. 点击 "Register application"
5. 复制生成的 **Client ID** 和 **Client Secret** 到 `.env` 文件

### 启动服务

```bash
# 开发模式（使用nodemon自动重启）
npm run dev

# 生产模式
npm start
```

服务器将在 <http://localhost:3000> 启动。

## 📡 API端点

### 健康检查

```
GET /health
```

返回服务器状态信息。

### 用户认证

```
POST /api/auth/login
```

用户登录。请求体：

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

```
POST /api/auth/register
```

用户注册。请求体：

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "用户名"
}
```

```
POST /api/auth/github
```

GitHub OAuth登录。请求体：

```json
{
  "code": "github_oauth_code"
}
```

```
GET /api/auth/me
```

获取当前用户信息。需要Bearer token认证。

### GitHub API代理

所有GitHub API代理端点都需要Bearer token认证。

```
GET /api/github/user
```

获取GitHub用户信息。

```
GET /api/github/repos
```

获取用户仓库列表。

```
GET /api/github/dashboard
```

获取GitHub仪表盘聚合数据（用户信息、仓库、提交记录、活动等）。

### 用户管理

```
GET /api/users/me
```

获取当前用户信息。

```
PUT /api/users/me
```

更新用户信息。

```
GET /api/users
```

获取所有用户列表（开发用）。

## 🔧 技术栈

- **Express.js** - Node.js Web框架
- **JWT** - JSON Web Tokens认证
- **bcryptjs** - 密码哈希
- **axios** - HTTP客户端
- **cors** - 跨域资源共享
- **dotenv** - 环境变量管理

## 🗂️ 项目结构

```
backend/
├── src/
│   ├── index.js              # 应用入口
│   ├── routes/               # API路由
│   │   ├── auth.routes.js    # 认证路由
│   │   ├── github.routes.js  # GitHub代理路由
│   │   └── user.routes.js    # 用户管理路由
│   ├── services/             # 业务逻辑服务
│   │   └── database.service.js # 内存数据库服务
│   ├── utils/                # 工具函数
│   │   └── api.utils.js      # API工具
│   └── middleware/           # Express中间件
├── package.json
├── .env.example             # 环境变量示例
└── README.md
```

## 🔐 安全说明

### 生产环境注意事项

1. **GitHub OAuth安全性**：
   - 后端代理保护了 `client_secret`，不会暴露给前端
   - 生产环境应使用HTTPS
   - 定期轮换GitHub OAuth凭据

2. **JWT安全性**：
   - 使用强密钥（至少32位随机字符串）
   - 设置合理的token过期时间
   - 考虑实现token刷新机制

3. **CORS配置**：
   - 生产环境应限制允许的来源域名
   - 避免使用通配符 `*`

### 数据存储

当前使用内存存储，适合开发和演示：

- **优点**：无需数据库配置，快速启动
- **缺点**：服务器重启后数据丢失

**生产环境建议**：

- 替换为SQLite（简单项目）
- 或PostgreSQL/MySQL（复杂项目）

## 🚦 开发模式

### 默认用户

开发模式下自动创建默认用户：

- **邮箱**: `demo@example.com`
- **密码**: `Demo@123`

### 开发工具

```
POST /api/users/dev/reset
```

清空内存数据库（仅开发环境可用）。

## 🔗 与前端集成

### 前端配置

在前端项目 `.env.local` 中配置：

```env
VITE_API_BASE=http://localhost:3000/api
```

### 认证流程

1. 用户在前端登录或通过GitHub OAuth授权
2. 前端调用后端认证API
3. 后端返回JWT token
4. 前端将token存储并用于后续API请求

### GitHub OAuth流程

1. 前端重定向到GitHub授权页面
2. GitHub回调到前端（携带code参数）
3. 前端将code发送到后端 `/api/auth/github`
4. 后端交换code获取GitHub access_token
5. 后端返回JWT token和GitHub数据

## 🐛 故障排除

### 常见问题

**GitHub OAuth失败**：

- 检查 `.env` 中的GitHub凭据是否正确
- 确认回调URL与GitHub OAuth应用配置一致
- 检查网络连接和GitHub API状态

**`getaddrinfo ENOTFOUND api.github.com`（DNS 解析失败）**：

- 说明本机 **DNS 无法解析** `api.github.com`，与 JWT、业务代码无关。
- 可将 Windows 网卡 DNS 改为 **8.8.8.8** / **1.1.1.1**，或开启 **VPN / 代理软件 TUN 模式**；仅浏览器能访问 GitHub 时，Node 进程仍可能使用不同 DNS，需一并处理。
- 若在 `.env` 配置了 `HTTPS_PROXY`，请确认代理已开启且端口正确。

**CORS错误**：

- 确认前端URL在 `.env` 的 `FRONTEND_URL` 中正确配置
- 检查前端是否使用了正确的端口

**JWT验证失败**：

- 确认token在请求头中正确传递：`Authorization: Bearer <token>`
- 检查JWT密钥配置

### 日志查看

服务器启动时显示所有可用API端点。所有请求都会在控制台记录。

## 📄 许可证

MIT

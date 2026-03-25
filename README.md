# AI Frontend Project

基于文档驱动开发的现代化前端项目，使用 React + Vite + TypeScript + Tailwind CSS 技术栈。

## ✨ 特性

- ⚡ **Vite** - 极速的开发服务器和构建工具
- ⚛️ **React 19** - 最新的 React 框架
- 📘 **TypeScript** - 类型安全的 JavaScript
- 🎨 **Tailwind CSS** - 实用优先的 CSS 框架
- 🧹 **ESLint** - 代码质量检查
- 📝 **文档驱动开发** - 功能思维导图工作流
- 🔐 **用户认证系统** - 完整的登录/注册/会话管理 (F-002)
- 📊 **开发者仪表盘** - GitHub数据可视化，提交记录统计 (F-003)
- 🔄 **GitHub集成** - OAuth认证，实时数据同步
- 📱 **响应式设计** - 移动端和桌面端适配

## 🚀 快速开始

### 环境要求
- Node.js 18+ 或 20+
- npm 或 yarn 或 pnpm

### 安装依赖
```bash
cd ai-frontend
npm install
```

### GitHub OAuth 配置（开发者仪表盘必需）
1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写以下信息：
   - **Application name**: AI Frontend Dashboard
   - **Homepage URL**: http://localhost:5173
   - **Authorization callback URL**: http://localhost:5173/auth/github/callback
4. 点击 "Register application"
5. 复制生成的 **Client ID**（`Client Secret` 只配置在后端）
6. 在项目根目录创建 `.env.local` 文件：
```bash
# 复制 .env.example 到 .env.local
cp .env.example .env.local
```
7. 编辑 `.env.local`，填入你的 GitHub OAuth 凭据：
```env
VITE_GITHUB_CLIENT_ID=your_client_id_here
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/github/callback
```

### 开发模式
```bash
npm run dev
```
访问 [http://localhost:5173](http://localhost:5173)

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 📁 项目结构

```
ai-frontend/
├── src/                    # 源代码
│   ├── auth/              # 用户认证模块 (F-002)
│   │   ├── components/    # 认证组件
│   │   ├── contexts/      # 认证上下文
│   │   ├── services/      # 认证服务
│   │   ├── types/         # 认证类型
│   │   └── utils/         # 认证工具
│   ├── dashboard/         # 开发者仪表盘模块 (F-003)
│   │   ├── components/    # 仪表盘组件
│   │   ├── contexts/      # GitHub上下文
│   │   ├── services/      # GitHub API服务
│   │   ├── types/         # GitHub类型
│   │   └── utils/         # GitHub工具
│   ├── assets/            # 静态资源
│   ├── App.tsx           # 主应用组件
│   ├── App.css           # 应用样式
│   ├── index.css         # 全局样式（包含Tailwind）
│   └── main.tsx          # 应用入口
├── scripts/              # 工具脚本
│   └── feature-map-manager.py  # 功能文档管理工具
├── public/               # 公共资源
├── docs/                # 模块化文档
├── FEATURE-MAP.md        # 功能思维导图（核心文档）
├── tailwind.config.js    # Tailwind CSS 配置
├── postcss.config.js     # PostCSS 配置
├── vite.config.ts       # Vite 配置
├── tsconfig.json        # TypeScript 配置
└── package.json         # 项目依赖
```

## 🎯 功能模块

### F-002: 用户认证系统
- ✅ 用户登录/注册界面
- ✅ 表单验证和错误处理
- ✅ React Context状态管理
- ✅ 会话持久化
- 📋 忘记密码功能（预留）
- 📋 第三方登录集成

### F-003: 开发者仪表盘
- ✅ GitHub OAuth认证集成
- ✅ 用户信息显示
- ✅ 仓库列表和统计
- ✅ 提交时间线
- ✅ 活动动态展示
- ✅ 数据可视化图表
- ✅ 响应式设计
- 📋 贡献图展示（待完善）
- 📋 数据分析报告（待完善）

### 即将开发
- F-004: 文件管理模块
- F-005: 响应式布局优化

## 📋 文档驱动开发工作流

本项目采用**功能思维导图**驱动的开发流程：

### 工作流阶段
1. **需求分析** → 先更新 `FEATURE-MAP.md`
2. **代码开发** → 基于功能文档实现
3. **代码测试** → 验证功能正确性
4. **CICD** → 自动化构建部署

### 功能文档管理
```bash
# 列出所有功能
npm run docs:list

# 查看功能详情
npm run docs:show F-001

# 分析依赖关系
npm run docs:deps F-001

# 验证文档完整性
npm run docs:validate

# 导出为JSON
npm run docs:export
```

### 功能文档结构
每个功能在 `FEATURE-MAP.md` 中包含：
- **功能描述** - 用途、用户故事、验收标准
- **依赖关系** - 上游/下游依赖
- **边界条件** - 输入/输出、限制条件
- **技术实现** - 实现方案、关键组件
- **测试用例** - 单元测试和集成测试场景
- **变更历史** - 版本变更记录

## 🛠️ 开发工具

### 代码规范
```bash
# 代码检查
npm run lint

# TypeScript 类型检查
npx tsc --noEmit
```

### Git 工作流
建议使用以下分支策略：
- `main` - 生产分支
- `develop` - 开发分支
- `feature/*` - 功能分支
- `bugfix/*` - 修复分支

### 提交规范
遵循 Conventional Commits：
- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码格式
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具

## 🎨 Tailwind CSS 使用

### 基本使用
```jsx
// 在组件中使用 Tailwind 类
function Button() {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      点击我
    </button>
  );
}
```

### 自定义配置
编辑 `tailwind.config.js` 添加自定义主题：
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'primary': '#3b82f6',
        'secondary': '#10b981',
      }
    }
  }
}
```

### 响应式设计
```jsx
// 移动端优先的响应式设计
<div className="w-full md:w-1/2 lg:w-1/3 p-4">
  响应式内容
</div>
```

## 🔧 环境变量

创建 `.env` 文件配置环境变量：
```env
VITE_API_BASE=http://localhost:3000/api
VITE_APP_TITLE=AI Frontend
```

在代码中使用：
```typescript
const apiBase = import.meta.env.VITE_API_BASE;
```

## 📊 现有功能

当前项目已实现的基础功能：

| 功能ID | 功能名称 | 状态 | 描述 |
|--------|----------|------|------|
| `F-001` | `项目基础框架` | ✅ 已实现 | React + Vite + TypeScript + Tailwind CSS 基础环境 |

查看完整功能列表：`FEATURE-MAP.md`

## 🚧 待开发功能

1. **用户认证系统** (`F-002`) - 登录/注册/权限管理
2. **AI对话界面** (`F-003`) - 消息历史/实时响应/多模型切换
3. **文件管理模块** (`F-004`) - 文件上传/预览/批量处理
4. **响应式布局** (`F-005`) - 移动端适配/桌面端优化

## 🤝 贡献指南

1. 在开发新功能前，先在 `FEATURE-MAP.md` 中添加功能条目
2. 遵循项目编码规范
3. 编写单元测试
4. 更新相关文档
5. 提交代码审查

## 📄 许可证

[MIT License](LICENSE)

---

**Happy Coding!** 🚀

> 提示：开始新功能开发前，务必先更新 `FEATURE-MAP.md` 功能文档。
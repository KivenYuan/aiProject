# AI Project

本仓库为单体仓库：**前端**（Vite + React + TypeScript）与 **后端**（Node.js + Express）。

## 目录结构

建议将本仓库所在文件夹命名为 **`ai-project`**（与内容一致即可；当前若仍叫 `ai-frontend` 仅影响本地路径，不影响运行）。

```
ai-project/
├── frontend/          # 前端应用
├── backend/           # 后端 API
├── LICENSE
└── README.md          # 本文件
```

## 本地开发

### 前端

```bash
cd frontend
npm install
npm run dev
```

开发地址：<http://localhost:5173>

### 后端

```bash
cd backend
npm install
npm run dev
```

API 默认：<http://localhost:3000>

## 环境变量

- 前端：复制 `frontend/.env.example` 为 `frontend/.env.local` 并按说明填写。
- 后端：复制 `backend/.env.example` 为 `backend/.env` 并按说明填写。

## 说明文档

功能说明、模块文档等在前端目录内：`frontend/README.md`、`frontend/FEATURE-MAP.md`、`frontend/docs/`。

## 遗留 `ai-backend/` 目录

若升级目录结构后本地仍出现名为 `ai-backend` 的旧文件夹（例如曾被进程占用无法删除），请关闭相关 Node 进程与编辑器占用后手动删除；若其中有 `.env`，请先复制到 `backend/.env`。

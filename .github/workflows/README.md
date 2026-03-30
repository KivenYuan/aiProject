# GitHub Actions CI/CD

本目录包含两条流水线：

- `ci.yml`：前后端 CI（安装依赖、测试、构建）
- `cd-huawei.yml`：当 `CI` 在 `master` 成功后，自动部署到华为云 ECS

## 需要配置的 GitHub Secrets

在仓库 `Settings -> Secrets and variables -> Actions` 中添加：

### 必填

- `HUAWEI_HOST`：ECS 公网 IP / 域名
- `HUAWEI_USER`：SSH 用户（例如 `root` 或 `ubuntu`）
- `HUAWEI_SSH_KEY`：私钥内容（多行）
- `HUAWEI_SSH_PORT`：SSH 端口（通常 `22`）
- `DEPLOY_DOMAIN`：线上域名（例如 `your-domain.com`）
- `REPO_SSH`：仓库 SSH 地址（例如 `git@github.com:KivenYuan/aiProject.git`）
- `PROJECT_DIR`：服务器部署目录（例如 `/var/www/ai-project`）
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `JWT_SECRET`
- `SESSION_SECRET`

### 选填（不填会用默认值）

- `GIT_BRANCH`：默认 `master`
- `ENABLE_HTTPS`：默认 `true`
- `EMAIL_FOR_LETSENCRYPT`：默认空
- `NODE_MAJOR`：默认 `20`
- `BACKEND_PORT`：默认 `3000`

## 触发方式

- CI：
  - Push 到 `master`
  - PR 指向 `master`
- CD：
  - `CI` 在 `master` 成功后自动触发
  - 支持手动触发（`workflow_dispatch`）

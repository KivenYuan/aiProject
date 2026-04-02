# GitHub Actions CI/CD

本目录包含两条流水线：

- `ci.yml`：前后端 CI（安装依赖、测试、构建）
- `cd.yml`：当 `CI` 在 `master` 成功后，通过 SSH 在目标服务器上拉取代码并执行 `deploy-remote.sh`

## 需要配置的 GitHub Secrets

在仓库 `Settings -> Secrets and variables -> Actions` 中添加：

### 必填

- `DEPLOY_SSH_HOST`：服务器公网 IP 或域名
- `DEPLOY_SSH_USER`：SSH 用户（例如 `root` 或 `ubuntu`）
- `DEPLOY_SSH_KEY`：SSH 私钥全文（多行）
- `DEPLOY_SSH_PORT`：SSH 端口（通常 `22`）
- `DEPLOY_DOMAIN`：线上站点域名（例如 `your-domain.com`），用于 Nginx/certificate 的主标识；可与 apex 对齐
- `DEPLOY_PUBLIC_HOST`（选填）：浏览器实际访问的主机名。若站点是 `https://www.example.com/` 而 `DEPLOY_DOMAIN` 为 `example.com`，请填 `www.example.com`，否则 OAuth 回调会与地址栏不一致
- `REPO_SSH`：仓库 SSH 地址（例如 `git@github.com:org/repo.git`），首次 `git clone` 必需
- `PROJECT_DIR`：服务器上的部署目录（例如 `/var/www/ai-project`）
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

若你之前使用 `HUAWEI_*` 命名的 Secret，请在 GitHub 中**新建**上述 `DEPLOY_SSH_*` 名称并填入相同值，然后删除旧 Secret。

## 触发方式

- CI：
  - Push 到 `master`
  - PR 指向 `master`
- CD：
  - `CI` 在 `master` 成功后自动触发
  - 支持手动触发（`workflow_dispatch`）

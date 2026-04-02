#!/usr/bin/env bash
# 生产/服务器部署：不包含任何密钥。
# 配置来源（优先级从高到低）：
#   1) 环境变量（GitHub Actions 经 appleboy/ssh-action 的 envs 传入）
#   2) 与本脚本同目录的 deploy.local.sh（手工部署时复制 deploy.local.sh.example，勿提交）
#
# Stack: Nginx + PM2 + Node.js

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_DIR/deploy.local.sh" ]]; then
  # shellcheck source=/dev/null
  source "$SCRIPT_DIR/deploy.local.sh"
fi

# 与 GitHub CD 中 Secret 名称对齐（支持 CLIENT_ID / CLIENT_SECRET 别名）
DOMAIN="${DOMAIN:-${DEPLOY_DOMAIN:-}}"
# 浏览器里实际访问的主机名（例如站点是 https://www.example.com/ 而 DEPLOY_DOMAIN 只写 example.com 时，设为 www.example.com）。
# 不设置时与 DOMAIN 一致（去掉端口）。OAuth 回调、VITE_API_BASE、FRONTEND_URL 均用 BASE_HOST。
PUBLIC_HOST="${PUBLIC_HOST:-${DEPLOY_PUBLIC_HOST:-${SITE_HOST:-}}}"
GITHUB_CLIENT_ID="${GITHUB_CLIENT_ID:-${CLIENT_ID:-}}"
GITHUB_CLIENT_SECRET="${GITHUB_CLIENT_SECRET:-${CLIENT_SECRET:-}}"
PROJECT_DIR="${PROJECT_DIR:-}"
REPO_SSH="${REPO_SSH:-}"
GIT_BRANCH="${GIT_BRANCH:-master}"
ENABLE_HTTPS="${ENABLE_HTTPS:-true}"
EMAIL_FOR_LETSENCRYPT="${EMAIL_FOR_LETSENCRYPT:-}"
# 服务器上证书文件的绝对路径；两者都设置且 ENABLE_HTTPS 开启时走自有证书，不再运行 certbot
SSL_CERTIFICATE_PATH="${SSL_CERTIFICATE_PATH:-}"
SSL_PRIVATE_KEY_PATH="${SSL_PRIVATE_KEY_PATH:-}"
NODE_MAJOR="${NODE_MAJOR:-20}"
BACKEND_PORT="${BACKEND_PORT:-3000}"

die() {
  echo "[ERROR] deploy-remote.sh: $*" >&2
  exit 1
}

require_non_empty() {
  local n="$1"
  [[ -n "${!n:-}" ]] || die "缺少环境变量 ${n}（请在 GitHub Environment/Repository Secrets 或 deploy.local.sh 中配置）"
}

require_non_empty DOMAIN
require_non_empty GITHUB_CLIENT_ID
require_non_empty GITHUB_CLIENT_SECRET
require_non_empty JWT_SECRET
require_non_empty SESSION_SECRET
require_non_empty PROJECT_DIR

if [[ "$PROJECT_DIR" != /* ]]; then
  die "PROJECT_DIR 必须是服务器上的绝对路径，例如 /var/www/ai-project（不要把 git URL 填在这里，仓库地址用 REPO_SSH）"
fi

DOMAIN_HOST="${DOMAIN%%:*}"
if [[ -n "$PUBLIC_HOST" ]]; then
  BASE_HOST="${PUBLIC_HOST%%:*}"
else
  BASE_HOST="$DOMAIN_HOST"
fi

# localhost / 仅本机：不装后端依赖（跳过 sqlite3 编译）、不启 PM2、不申请 Let's Encrypt
SKIP_BACKEND=false
if [[ "$DOMAIN" == localhost* ]] || [[ "$DOMAIN" == 127.0.0.1* ]]; then
  SKIP_BACKEND=true
fi

# Nginx / certbot：保留 DOMAIN 对应的主机名；若 PUBLIC_HOST 不同则同时监听（如 apex + www）
if [[ "$BASE_HOST" != "$DOMAIN_HOST" ]]; then
  NGINX_SERVER_NAME="${DOMAIN_HOST} ${BASE_HOST}"
else
  NGINX_SERVER_NAME="${DOMAIN_HOST}"
fi

if [[ "$SKIP_BACKEND" == "true" ]]; then
  echo "[INFO] DOMAIN 为 localhost/127.0.0.1：跳过后端 npm 安装与 PM2；HTTPS 将跳过。"
  ENABLE_HTTPS_EFFECTIVE="false"
else
  ENABLE_HTTPS_EFFECTIVE="$ENABLE_HTTPS"
fi

if [[ "$SKIP_BACKEND" != "true" ]]; then
  if [[ "$ENABLE_HTTPS_EFFECTIVE" == "true" || "$ENABLE_HTTPS_EFFECTIVE" == "1" ]]; then
    BASE_URL="https://${BASE_HOST}"
  else
    BASE_URL="http://${BASE_HOST}"
  fi
else
  BASE_URL="http://${BASE_HOST}"
fi

USE_CUSTOM_SSL=false
if [[ "$SKIP_BACKEND" != "true" ]] && { [[ "$ENABLE_HTTPS_EFFECTIVE" == "true" ]] || [[ "$ENABLE_HTTPS_EFFECTIVE" == "1" ]]; }; then
  if [[ -n "$SSL_CERTIFICATE_PATH" || -n "$SSL_PRIVATE_KEY_PATH" ]]; then
    [[ -n "$SSL_CERTIFICATE_PATH" && -n "$SSL_PRIVATE_KEY_PATH" ]] || die "自定义 HTTPS 需同时设置 SSL_CERTIFICATE_PATH 与 SSL_PRIVATE_KEY_PATH（服务器上的绝对路径）"
    [[ "$SSL_CERTIFICATE_PATH" == /* ]] || die "SSL_CERTIFICATE_PATH 必须是绝对路径"
    [[ "$SSL_PRIVATE_KEY_PATH" == /* ]] || die "SSL_PRIVATE_KEY_PATH 必须是绝对路径"
    USE_CUSTOM_SSL=true
  fi
fi

echo "[1/9] Install system packages..."
sudo apt update
sudo apt install -y git curl nginx ca-certificates gnupg
if [[ "$SKIP_BACKEND" != "true" ]]; then
  sudo apt install -y build-essential python3 make g++
fi

echo "[2/9] Install Node.js ${NODE_MAJOR}.x if missing..."
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
  sudo apt install -y nodejs
fi
node -v
npm -v

echo "[3/9] Install PM2 globally if missing..."
if [[ "$SKIP_BACKEND" != "true" ]]; then
  if ! command -v pm2 >/dev/null 2>&1; then
    sudo npm i -g pm2
  fi
fi

echo "[4/9] Pull project..."
sudo mkdir -p "$(dirname "$PROJECT_DIR")"
if [[ ! -d "$PROJECT_DIR/.git" ]]; then
  require_non_empty REPO_SSH
  sudo git clone "$REPO_SSH" "$PROJECT_DIR"
fi
sudo chown -R "$USER:$USER" "$PROJECT_DIR"
cd "$PROJECT_DIR"
git fetch --all
git checkout "$GIT_BRANCH"
git pull origin "$GIT_BRANCH"

if [[ ! -d "$PROJECT_DIR/frontend" ]]; then
  die "缺少 $PROJECT_DIR/frontend — clone 可能失败或 PROJECT_DIR 配置错误。"
fi

write_frontend_env() {
  local vite_api vite_redirect
  if [[ "$SKIP_BACKEND" == "true" ]]; then
    vite_api="http://127.0.0.1:${BACKEND_PORT}/api"
    vite_redirect="http://${BASE_HOST}/auth/github/callback"
  else
    vite_api="${BASE_URL}/api"
    vite_redirect="${BASE_URL}/auth/github/callback"
  fi
  (
    umask 077
    {
      printf 'VITE_API_BASE=%q\n' "$vite_api"
      printf 'VITE_GITHUB_CLIENT_ID=%q\n' "$GITHUB_CLIENT_ID"
      printf 'VITE_GITHUB_REDIRECT_URI=%q\n' "$vite_redirect"
    } >"$PROJECT_DIR/frontend/.env.production"
  )
}

write_backend_env() {
  local node_env="production"
  [[ "$SKIP_BACKEND" == "true" ]] && node_env="development"
  (
    umask 077
    {
      printf 'PORT=%q\n' "$BACKEND_PORT"
      printf 'NODE_ENV=%q\n' "$node_env"
      printf 'FRONTEND_URL=%q\n' "$BASE_URL"
      printf 'GITHUB_CLIENT_ID=%q\n' "$GITHUB_CLIENT_ID"
      printf 'GITHUB_CLIENT_SECRET=%q\n' "$GITHUB_CLIENT_SECRET"
      printf 'GITHUB_REDIRECT_URI=%q\n' "${BASE_URL}/auth/github/callback"
      printf 'JWT_SECRET=%q\n' "$JWT_SECRET"
      printf 'JWT_EXPIRES_IN=%q\n' "7d"
      printf 'SESSION_SECRET=%q\n' "$SESSION_SECRET"
      printf 'DATABASE_PATH=%q\n' "./database.sqlite"
    } >"$PROJECT_DIR/backend/.env"
  )
  chmod 600 "$PROJECT_DIR/backend/.env"
}

echo "[5/9] Write frontend production env..."
write_frontend_env

echo "[6/9] Write backend env..."
write_backend_env

echo "[7/9] Build frontend + install backend deps..."
cd "$PROJECT_DIR/frontend"
npm ci
npm run build

# Ensure dist/ is readable by nginx (www-data)
chmod -R o+rX "$PROJECT_DIR/frontend/dist"

if [[ "$SKIP_BACKEND" != "true" ]]; then
  echo "[7b/9] Backend deps (sqlite3 native build)..."
  cd "$PROJECT_DIR/backend"
  export npm_config_python="${npm_config_python:-/usr/bin/python3}"
  rm -rf node_modules
  npm ci --omit=dev

  echo "[8/9] Start/restart backend with PM2..."
  if pm2 describe ai-backend >/dev/null 2>&1; then
    pm2 restart ai-backend
  else
    pm2 start src/index.js --name ai-backend --cwd "$PROJECT_DIR/backend"
  fi
  pm2 save
else
  echo "[7b/9] Skipped: backend npm ci / sqlite3（SKIP_BACKEND）"
  echo "[8/9] Skipped: PM2 backend（SKIP_BACKEND）— 可在本机手动: cd backend && npm install && npm start"
fi

echo "[9/9] Configure Nginx..."
if [[ "$USE_CUSTOM_SSL" == "true" ]]; then
  sudo test -r "$SSL_CERTIFICATE_PATH" || die "无法读取证书文件（nginx 需可读）: $SSL_CERTIFICATE_PATH"
  sudo test -r "$SSL_PRIVATE_KEY_PATH" || die "无法读取私钥文件（nginx 需可读）: $SSL_PRIVATE_KEY_PATH"
  sudo tee /etc/nginx/sites-available/ai-project >/dev/null <<EOF
server {
    listen 80;
    server_name ${NGINX_SERVER_NAME};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${NGINX_SERVER_NAME};

    ssl_certificate ${SSL_CERTIFICATE_PATH};
    ssl_certificate_key ${SSL_PRIVATE_KEY_PATH};

    root ${PROJECT_DIR}/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT}/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        try_files \$uri /index.html;
    }
}
EOF
else
  sudo tee /etc/nginx/sites-available/ai-project >/dev/null <<EOF
server {
    listen 80;
    server_name ${NGINX_SERVER_NAME};

    root ${PROJECT_DIR}/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT}/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        try_files \$uri /index.html;
    }
}
EOF
fi

sudo ln -sf /etc/nginx/sites-available/ai-project /etc/nginx/sites-enabled/ai-project
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

if [[ "$ENABLE_HTTPS_EFFECTIVE" == "true" || "$ENABLE_HTTPS_EFFECTIVE" == "1" ]]; then
  if [[ "$USE_CUSTOM_SSL" == "true" ]]; then
    echo "[extra] Skipped certbot（使用 SSL_CERTIFICATE_PATH / SSL_PRIVATE_KEY_PATH 自有证书）"
  else
    echo "[extra] Configure HTTPS with certbot..."
    sudo apt install -y certbot python3-certbot-nginx
    certbot_domains=()
    if [[ "$BASE_HOST" != "$DOMAIN_HOST" ]]; then
      certbot_domains=(-d "$DOMAIN_HOST" -d "$BASE_HOST")
    else
      certbot_domains=(-d "$DOMAIN_HOST")
    fi
    if [[ -n "$EMAIL_FOR_LETSENCRYPT" ]]; then
      sudo certbot --nginx "${certbot_domains[@]}" -m "$EMAIL_FOR_LETSENCRYPT" --agree-tos --no-eff-email --non-interactive
    else
      sudo certbot --nginx "${certbot_domains[@]}" --agree-tos --register-unsafely-without-email --non-interactive
    fi
  fi
else
  echo "[extra] Skipped: HTTPS / certbot（localhost 模式或 ENABLE_HTTPS_EFFECTIVE=false）"
fi

echo
echo "===== Deploy done ====="
if [[ "$SKIP_BACKEND" == "true" ]]; then
  echo "Mode: localhost — 仅构建前端 + Nginx 静态；后端请本机手动启动（见上）"
  echo "Frontend (nginx): http://${NGINX_SERVER_NAME}"
  echo "Backend (manual): http://127.0.0.1:${BACKEND_PORT}/health"
else
  echo "Frontend: ${BASE_URL}"
  echo "Backend health: ${BASE_URL}/health"
  if [[ "$BASE_HOST" != "$DOMAIN_HOST" ]]; then
    echo "Nginx server_name: ${NGINX_SERVER_NAME}（OAuth 与 API 基址使用公网主机名 ${BASE_HOST}）"
  fi
fi
echo
echo "Important:"
if [[ "$SKIP_BACKEND" != "true" ]]; then
  echo "1) In GitHub OAuth App, callback URL must be: ${BASE_URL}/auth/github/callback"
  echo "2) If security group not open 80/443, site may be unreachable."
  echo "3) Check logs: pm2 logs ai-backend | sudo tail -f /var/log/nginx/error.log"
else
  echo "1) OAuth callback 请与 frontend .env 中 VITE_GITHUB_REDIRECT_URI 一致"
  echo "2) 访问 /api 需先在本机启动后端: cd backend && npm install && npm start"
fi

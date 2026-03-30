# Frontend UI Automation (Python + Pytest + Playwright)

## 目标

- 支持 Windows / Linux
- UI 层与测试逻辑层分离（Page Object Model）
- 每个用例只验证一个功能点，便于维护和定位问题

## 目录结构

```text
tests/e2e/
├── conftest.py           # 公共 fixture（基础 URL、前端可达性检查）
├── requirements.txt      # Python 依赖
├── pytest.ini            # pytest 配置
├── pages/                # UI 层（页面对象）
│   ├── base_page.py
│   ├── auth_page.py
│   └── dashboard_page.py
└── tests/                # 测试逻辑层（每个用例单一职责）
    ├── test_auth_navigation.py
    ├── test_login_validation.py
    ├── test_register_validation.py
    └── test_dashboard_guest_view.py
```

## 前置条件

1. 前端启动（默认地址 `http://localhost:5173`）  
2. Python 3.10+ 可用

## 安装与运行

### Windows (PowerShell)

```powershell
cd tests/e2e
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m playwright install chromium
python -m pytest
```

### Linux (bash)

```bash
cd tests/e2e
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m playwright install chromium
python -m pytest
```

## 可配置项

- `APP_BASE_URL`：默认 `http://localhost:5173`

示例：

```bash
APP_BASE_URL=http://localhost:4173 python -m pytest
```

## 现有用例说明（单一功能）

- `test_auth_tab_switching`：验证登录/注册 tab 切换
- `test_login_requires_email_and_password`：验证登录必填校验
- `test_register_requires_matching_passwords`：验证注册密码一致性校验
- `test_dashboard_guest_shows_login_options`：验证未登录仪表盘入口按钮展示

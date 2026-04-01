import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme, Button } from 'antd';
import { SunOutlined, MoonOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { AuthProvider } from './auth/contexts/AuthContext';
import { GitHubProvider } from './dashboard/contexts/GitHubContext';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import AuthPage from './auth/components/AuthPage';
import DashboardPage from './dashboard/components/DashboardPage';
import './App.css';

function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">404</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">页面未找到</h2>
      <p className="mt-2 max-w-md text-slate-600 dark:text-slate-400">链接可能已失效，请返回仪表盘继续浏览。</p>
      <Button
        type="primary"
        icon={<ArrowLeftOutlined />}
        size="large"
        className="mt-8"
        onClick={() => navigate('/dashboard')}
      >
        返回仪表盘
      </Button>
    </div>
  );
}

function AppShell() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#4f46e5',
          borderRadius: 8,
        },
      }}
    >
      <div className="flex min-h-screen flex-col bg-slate-50 bg-mesh-light font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-2 px-4 py-2 sm:min-h-16 sm:px-6 sm:py-0 lg:px-8">
            <NavLink to="/dashboard" className="group flex min-w-0 items-center gap-2 text-left sm:gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-700 text-xs font-bold text-white shadow-soft ring-1 ring-white/20 sm:h-9 sm:w-9 sm:text-sm">
                DM
              </span>
              <span className="flex flex-col leading-tight">
                <span className="whitespace-nowrap text-sm font-semibold tracking-tight text-slate-900 group-hover:text-brand-700 dark:text-slate-100 sm:text-base">
                  Dev Metrics
                </span>
                <span className="hidden text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:block">
                  Portfolio · GitHub 数据看板
                </span>
              </span>
            </NavLink>

            <nav className="flex items-center gap-1 sm:gap-2">
              <Button
                type="text"
                icon={isDark ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggleTheme}
                title={isDark ? '切换到浅色模式' : '切换到深色模式'}
                size="middle"
              >
                <span className="hidden sm:inline">{isDark ? '浅色' : '深色'}</span>
              </Button>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  [
                    'rounded-lg px-2 py-1.5 text-sm font-medium transition-colors sm:px-3 sm:py-2',
                    isActive
                      ? 'bg-brand-50 text-brand-800 ring-1 ring-brand-200/80 dark:bg-brand-900/40 dark:text-brand-200 dark:ring-brand-700/60'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
                  ].join(' ')
                }
              >
                仪表盘
              </NavLink>
              <NavLink
                to="/auth"
                className={({ isActive }) =>
                  [
                    'rounded-lg px-2 py-1.5 text-sm font-medium transition-colors sm:px-3 sm:py-2',
                    isActive
                      ? 'bg-brand-50 text-brand-800 ring-1 ring-brand-200/80 dark:bg-brand-900/40 dark:text-brand-200 dark:ring-brand-700/60'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
                  ].join(' ')
                }
              >
                账户
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/auth/github/callback"
              element={
                <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
                  <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/90 p-10 text-center shadow-card backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
                    <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600 dark:border-slate-700" />
                    <p className="text-base font-medium text-slate-800 dark:text-slate-100">正在连接 GitHub</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">安全交换授权码后即将进入仪表盘</p>
                  </div>
                </div>
              }
            />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <footer className="border-t border-slate-200/80 bg-white/60 py-8 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Dev Metrics — 全栈能力展示项目</p>
            <p className="mt-2 hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
              React 19 · Vite · TypeScript · Tailwind · Express · JWT · GitHub OAuth
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:hidden">
              React · Vite · TS · Tailwind · Express
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {['OAuth 2.0', 'REST 代理', '响应式 UI'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-slate-400/60 underline-offset-2 transition-colors hover:text-slate-700 dark:hover:text-slate-300"
              >
                陕ICP备2026006967号-1
              </a>
            </p>
          </div>
        </footer>
      </div>
    </ConfigProvider>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <GitHubProvider>
            <AppShell />
          </GitHubProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { AuthProvider } from './auth/contexts/AuthContext';
import { GitHubProvider } from './dashboard/contexts/GitHubContext';
import AuthPage from './auth/components/AuthPage';
import DashboardPage from './dashboard/components/DashboardPage';
import './App.css';

function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 bg-mesh-light font-sans text-slate-900 antialiased">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <NavLink to="/dashboard" className="group flex items-center gap-3 text-left">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-700 text-sm font-bold text-white shadow-soft ring-1 ring-white/20">
              DM
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-base font-semibold tracking-tight text-slate-900 group-hover:text-brand-700">
                Dev Metrics
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Portfolio · GitHub 数据看板
              </span>
            </span>
          </NavLink>

          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                [
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-800 ring-1 ring-brand-200/80'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                ].join(' ')
              }
            >
              仪表盘
            </NavLink>
            <NavLink
              to="/auth"
              className={({ isActive }) =>
                [
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-800 ring-1 ring-brand-200/80'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
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
                <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/90 p-10 text-center shadow-card backdrop-blur-sm">
                  <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
                  <p className="text-base font-medium text-slate-800">正在连接 GitHub</p>
                  <p className="mt-2 text-sm text-slate-500">安全交换授权码后即将进入仪表盘</p>
                </div>
              </div>
            }
          />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="*"
            element={
              <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center">
                <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">404</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">页面未找到</h2>
                <p className="mt-2 max-w-md text-slate-600">链接可能已失效，请返回仪表盘继续浏览作品展示。</p>
                <NavLink
                  to="/dashboard"
                  className="mt-8 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-soft transition hover:bg-slate-800"
                >
                  返回仪表盘
                </NavLink>
              </div>
            }
          />
        </Routes>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/60 py-10 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-slate-700">Dev Metrics — 全栈能力展示项目</p>
          <p className="mt-2 text-xs text-slate-500">
            React 19 · Vite · TypeScript · Tailwind · Express · JWT · GitHub OAuth
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {['OAuth 2.0', 'REST 代理', '响应式 UI'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <GitHubProvider>
          <AppShell />
        </GitHubProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

import { AuthProvider } from './auth/contexts/AuthContext';
import AuthPage from './auth/components/AuthPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
              <h1 className="text-xl font-bold text-gray-800">AI Frontend</h1>
            </div>
            <div className="text-sm text-gray-500">
              React + Vite + TypeScript + Tailwind CSS
            </div>
          </div>
        </header>
        
        <main className="w-full">
          <AuthPage />
        </main>
        
        <footer className="mt-12 py-6 border-t border-gray-200">
          <div className="px-4 text-center text-gray-500 text-sm">
            <p>AI Frontend Project © 2026 - 用户认证系统演示 (F-002)</p>
            <p className="mt-2">
              状态：开发中 | 功能：登录/注册/会话管理 | 技术：React Context + TypeScript
            </p>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
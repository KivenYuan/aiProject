import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Expose selected runtime env for modules used in Jest/CommonJS contexts.
(globalThis as { __APP_ENV__?: Record<string, string | undefined> }).__APP_ENV__ = {
  VITE_API_BASE: import.meta.env.VITE_API_BASE,
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

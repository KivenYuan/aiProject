/**
 * Must be imported before any module that reads globalThis.__APP_ENV__
 * (e.g. authService). Entry main.tsx imports this first so env is ready
 * when those modules initialize.
 */
;(globalThis as { __APP_ENV__?: Record<string, string | undefined> }).__APP_ENV__ = {
  VITE_API_BASE: import.meta.env.VITE_API_BASE,
}

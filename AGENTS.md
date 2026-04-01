# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a monorepo with two independent npm projects (`frontend/` and `backend/`) plus Python-based E2E tests (`tests/e2e/`). There is no workspace-level `package.json`; run `npm install` separately in each directory.

### Services

| Service | Port | Start command | Notes |
|---------|------|--------------|-------|
| Backend (Express API) | 3000 | `cd backend && npm run dev` | Uses in-memory DB; auto-creates demo user `demo@example.com` / `Demo@123` |
| Frontend (Vite dev) | 5173 | `cd frontend && npm run dev` | Requires backend running for auth/API calls |

### Environment files

- **Backend**: copy `backend/.env.example` to `backend/.env`. The only required value is `JWT_SECRET` (set any string). Disable `HTTPS_PROXY` by commenting it out. GitHub OAuth keys are optional (demo mode uses mock data).
- **Frontend**: copy `frontend/.env.example` to `frontend/.env.local`. Defaults work out of the box.

### Commands reference

See `frontend/package.json` and `backend/package.json` for all scripts. Key commands:

- **Lint**: `cd frontend && npm run lint` (pre-existing lint errors exist in the repo; these are not from your changes)
- **Tests**: `cd frontend && npm test` (Jest, 35 tests) and `cd backend && npm test` (no tests currently)
- **Build**: `cd frontend && npm run build` (runs `tsc -b && vite build`)
- **Type check**: `cd frontend && npx tsc --noEmit`

### Gotchas

- The backend uses `nodemon` for dev mode and stores data in-memory. Restarting the backend process resets all users (the demo user is re-seeded on startup).
- `npm run lint` in frontend exits with code 1 due to pre-existing errors (mostly `@typescript-eslint/no-explicit-any` and `react-refresh/only-export-components`). This is normal for this repo.
- Start the backend before the frontend to ensure API calls succeed immediately on page load.
- GitHub OAuth features require real GitHub OAuth credentials. Without them, use the "开发模式（模拟数据）" (Development mode - mock data) button on the dashboard page to view the demo dashboard.

# CryptoTracker

A full‑stack crypto dashboard with authentication and personal watchlist. The frontend (React + Vite + Tailwind) consumes a Node/Express API backed by MongoDB with JWT auth.

## Features
- Authentication: signup, login, persistent session via JWT
- Personal watchlist: add/remove/clear tracked coins
- Market data: CoinGecko markets (top 250) with caching on client
- Responsive UI: Tailwind, framer‑motion animations, optional 3D/three.js visuals

## Tech Stack
- Backend: Express 5, Mongoose (MongoDB), JWT, bcryptjs, CORS, dotenv
- Frontend: React 19, Vite 7, React Router 7, Tailwind CSS 4, Framer Motion, Chart.js, Three.js
- Deployment: Frontend friendly for Vercel (rewrite config included)

## Monorepo Layout
```
backend/           # Node/Express API
frontend/          # React + Vite app
```
Key files:
- API server: [backend/index.js](backend/index.js)
- Routes: [backend/routes/auth.js](backend/routes/auth.js), [backend/routes/watchlist.js](backend/routes/watchlist.js)
- Auth middleware: [backend/middleware/auth.js](backend/middleware/auth.js)
- User model: [backend/models/User.js](backend/models/User.js)
- Frontend API client: [frontend/src/api/auth.js](frontend/src/api/auth.js), [frontend/src/api/coinList.js](frontend/src/api/coinList.js)
- Vite config: [frontend/vite.config.js](frontend/vite.config.js)
- Vercel rewrites: [frontend/vercel.json](frontend/vercel.json)

## Requirements
- Node.js 18+ and npm
- MongoDB connection string (Atlas or local)

## Environment Variables
Create backend/.env with:
```
# Backend
PORT=5000                # optional; defaults to 5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-long-random-secret
```
Notes:
- CORS allows http://localhost:5173 by default; update origins in [backend/index.js](backend/index.js) when deploying.
- Frontend currently points to `http://localhost:3000/api` (see [frontend/src/api/auth.js](frontend/src/api/auth.js)). Update this to match your backend port (5000 by default) or refactor to use `VITE_API_BASE_URL`.

Optional frontend .env (if you refactor):
```
# Frontend (optional improvement)
VITE_API_BASE_URL=http://localhost:5000/api
```

## Install
From the repo root, install both apps:

```bash
# Backend deps
cd backend
npm install

# Frontend deps (in a second terminal or after)
cd ../frontend
npm install
```

## Run (Development)
Start backend and frontend in separate terminals:

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```
If you keep `PORT=5000`, make sure the frontend API base matches `http://localhost:5000/api`.

### One‑liner (macOS)
```bash
( cd backend && npm run dev ) & ( cd frontend && npm run dev )
```

## Build & Preview (Frontend)
```bash
cd frontend
npm run build
npm run preview
```

## API Reference
Base URL: `http://localhost:<PORT>/api`

Auth
- POST `/auth/register` — body: `{ email, password }`
- POST `/auth/login` — body: `{ email, password }`
- GET `/auth/me` — header: `Authorization: Bearer <token>`
- POST `/auth/logout` — header: `Authorization: Bearer <token>`

Watchlist (all require `Authorization: Bearer <token>`)
- GET `/watchlist` — returns `{ watchlist: string[] }`
- POST `/watchlist/add` — body: `{ coinId }`
- POST `/watchlist/remove` — body: `{ coinId }`
- DELETE `/watchlist/clear`

## Frontend Integration
- Auth state is stored in `localStorage` (token + user)
- Use the context in [frontend/src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx)
- Market data via CoinGecko in [frontend/src/api/coinList.js](frontend/src/api/coinList.js)

## Deployment
- Frontend: Vercel ready (see [frontend/vercel.json](frontend/vercel.json)). Set production API base to your backend URL.
- Backend: Deploy to Render, Railway, Fly.io, etc. Set env vars `MONGODB_URI` and `JWT_SECRET`. Update CORS origins in [backend/index.js](backend/index.js).

## Troubleshooting
- 401 Unauthorized: Ensure you send `Authorization: Bearer <token>`.
- CORS error: Add your frontend origin to the `cors` `origin` list in [backend/index.js](backend/index.js).
- MongoDB connect error: Verify `MONGODB_URI` and network/IP allow list.
- Port mismatch: Align frontend API base with backend `PORT`.

## Scripts
Backend
- `npm run dev` — start with nodemon
- `npm start` — start with node

Frontend
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview built app

## License
ISC (see package.json)

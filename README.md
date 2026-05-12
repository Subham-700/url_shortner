# URL Shortener — MERN + TypeScript + Redis

A production-ready, scalable URL shortener built with MongoDB, Express, React, Node.js, TypeScript, and Redis.

## Architecture Overview

```
Frontend (React + Vite)
    ↓  HTTPS
Backend (Express + TypeScript)
    ↓                ↓
MongoDB          Redis Cache
(persistent)    (hot path / TTL)
```

### Redirect Flow (hot path)
1. Request hits Express
2. Check Redis cache → if hit, redirect instantly (~1ms)
3. Cache miss → query MongoDB, populate cache, redirect
4. Analytics tracked **asynchronously** (doesn't block redirect)

## Features

- **URL Shortening** — generate 7-char nanoid codes or custom aliases
- **Redis Caching** — sub-millisecond redirects, configurable TTL
- **Auth** — JWT-based register/login with bcrypt password hashing
- **Analytics** — click tracking, device detection, browser, referrers
- **Rate Limiting** — different limits per route (redirects vs API)
- **Validation** — Zod schemas on all inputs
- **Docker-ready** — full docker-compose setup

## Project Structure

```
url-shortener/
├── backend/
│   └── src/
│       ├── config/          # env, database, redis
│       ├── controllers/     # request handlers
│       ├── middleware/      # auth, rate limit, validate
│       ├── models/          # Mongoose schemas
│       ├── routes/          # Express routers
│       ├── services/        # business logic
│       ├── types/           # TypeScript interfaces
│       └── utils/           # logger, errors, shortCode
└── frontend/
    └── src/
        ├── hooks/           # Zustand auth store
        ├── pages/           # HomePage, Dashboard, Analytics, Auth
        ├── services/        # Axios API client
        └── types/
```

## Quick Start

### 1. Start dependencies

```bash
# Start MongoDB + Redis with Docker
docker-compose up mongo redis -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — add your MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at http://localhost:3000

### 4. Full Docker stack

```bash
JWT_SECRET=your-secret docker-compose up --build
```

## API Reference

### Auth
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | `{email, password, name}` | Create account |
| POST | `/api/auth/login` | `{email, password}` | Get JWT token |
| GET | `/api/auth/me` | — | Current user |

### URLs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/urls` | Optional | Create short URL |
| GET | `/api/urls` | Required | List user's URLs |
| GET | `/api/urls/:code` | Required | Get URL details |
| PUT | `/api/urls/:code` | Required | Update URL |
| DELETE | `/api/urls/:code` | Required | Delete URL |
| GET | `/api/urls/:code/analytics` | Required | Get analytics |
| GET | `/:code` | None | Redirect (hot path) |

### Create URL request body
```json
{
  "originalUrl": "https://example.com/very/long/path",
  "customAlias": "my-link",         // optional, 3-20 chars
  "title": "My Link",               // optional
  "expiresAt": "2025-12-31T00:00:00Z"  // optional
}
```

## Scalability Notes

- **Redis** serves the redirect hot path — horizontal scaling works because all nodes share the same cache
- **MongoDB indexes** on `shortCode`, `customAlias`, `userId + createdAt`
- **Analytics writes** are fire-and-forget (non-blocking redirect)
- **Connection pooling** configured on both MongoDB (maxPoolSize: 10) and Redis
- **TTL indexes** on Click documents (90 day auto-expiry)
- **Rate limiting** per IP with express-rate-limit

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `MONGODB_URI` | — | MongoDB connection string |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_TTL` | `86400` | Cache TTL in seconds |
| `JWT_SECRET` | — | JWT signing secret |
| `SHORT_CODE_LENGTH` | `7` | Generated code length |
| `RATE_LIMIT_MAX` | `100` | Requests per window |

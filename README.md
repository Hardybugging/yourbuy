# YourBuy

YourBuy is a Next.js + NestJS investing workspace with MySQL, Prisma, Redis-ready caching, simulated trading, portfolio analytics, market APIs, watchlists, notifications, AI assistance, and Socket.IO realtime hooks.

## Local setup

1. Start infrastructure: `docker compose up -d`
2. Backend:
   - `cd yourbuy-backend`
   - copy `.env.example` to `.env`
   - `npm install`
   - `npm run prisma:dev -- --name init`
   - `npm run start:dev`
3. Frontend:
   - `cd yourbuy-frontend`
   - `npm install`
   - `npm run dev`

## Deployment

Backend requires `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, and optionally `REDIS_URL`, `TWELVEDATA_API_KEY`, `FINNHUB_API_KEY`, `OPENROUTER_API_KEY`, and `NEWS_API_KEY`.

Run `npm run build` in both apps before deployment.

export const envConfig = () => ({
  port: Number(process.env.PORT || 3001),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'dev-access-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  redisUrl: process.env.REDIS_URL,
  providers: {
    twelveDataApiKey: process.env.TWELVEDATA_API_KEY,
    finnhubApiKey: process.env.FINNHUB_API_KEY,
    openRouterApiKey: process.env.OPENROUTER_API_KEY,
    newsApiKey: process.env.NEWS_API_KEY,
  },
});

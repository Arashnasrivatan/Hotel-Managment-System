module.exports = {
  db: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    poolSize: process.env.DB_POOL_SIZE || 30,
  },

  domain: process.env.DOMAIN,

  isProduction: process.env.NODE_ENV === "production",
  port: parseInt(process.env.PORT) || 4000,

  auth: {
    accessTokenSecretKey: process.env.ACCESS_TOKEN_SECRET_KEY,
    refreshTokenSecretKey: process.env.REFRESH_TOKEN_SECRET_KEY,
    accessTokenExpiresInSeconds: process.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    refreshTokenExpiresInSeconds: process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS,
  },

  redis: {
    uri: process.env.REDIS_URL,
  },

  zibal: {
    merchant: process.env.ZIBAL_MERCHANT,
    base_url: process.env.ZIBAL_BASE_URL,
    payment_base_url: process.env.ZIBAL_PAYMENT_BASE_URL,
    callback_url: process.env.ZIBAL_CALLBACK_URL
  },
};

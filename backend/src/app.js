const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');
const { createRateLimiter } = require('./middlewares/rateLimit.middleware');

const app = express();
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const apiRateLimiter = createRateLimiter({
  scope: 'api',
  windowMs: env.rateLimitWindowMs,
  maxRequests: env.rateLimitMaxRequests,
  keyStrategy: 'user-or-ip',
  message: 'Too many API requests. Please slow down and try again shortly.',
  errorCode: 'API_RATE_LIMIT_EXCEEDED',
  skip: (req) =>
    req.method === 'OPTIONS' ||
    (env.nodeEnv !== 'production' && SAFE_METHODS.has(req.method)),
});

app.set('trust proxy', env.trustProxy);
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Movie Booking API is running',
    data: null
  });
});

app.use('/api/v1', apiRateLimiter);
app.use(routes);

app.use(errorMiddleware);

module.exports = app;

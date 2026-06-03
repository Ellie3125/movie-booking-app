const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const env = require('./config/env');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');
const { createRateLimiter } = require('./middlewares/rateLimit.middleware');

const app = express();

// Configure CORS
const allowedOrigins = [
  'http://localhost:5173', // Admin Web (Vite)
  'http://localhost:3000', // Common alternative
  'http://localhost:8081', // Mobile app (if running in web mode)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || env.nodeEnv === 'development') {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(morgan('dev'));

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

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Movie Booking API is running',
    data: null
  });
});

app.use('/api/v1', apiRateLimiter);
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use(routes);

app.use(errorMiddleware);

module.exports = app;

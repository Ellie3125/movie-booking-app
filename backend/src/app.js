const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');
const { createRateLimiter } = require('./middlewares/rateLimit.middleware');

const app = express();
const apiRateLimiter = createRateLimiter({
  scope: 'api',
  windowMs: env.rateLimitWindowMs,
  maxRequests: env.rateLimitMaxRequests,
  keyStrategy: 'ip',
  message: 'Too many API requests. Please slow down and try again shortly.',
  errorCode: 'API_RATE_LIMIT_EXCEEDED',
});

app.set('trust proxy', env.trustProxy);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
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

const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { createRateLimiter } = require('../middlewares/rateLimit.middleware');
const validate = require('../middlewares/validate.middleware');
const env = require('../config/env');
const authValidation = require('../validations/auth.validation');

const router = express.Router();
const authRateLimiter = createRateLimiter({
  scope: 'auth',
  windowMs: env.authRateLimitWindowMs,
  maxRequests: env.authRateLimitMaxRequests,
  keyStrategy: 'ip',
  message: 'Too many authentication attempts. Please wait before trying again.',
  errorCode: 'AUTH_RATE_LIMIT_EXCEEDED',
});

router.post(
  '/register',
  authRateLimiter,
  validate(authValidation.registerSchema),
  authController.register
);
router.post(
  '/login',
  authRateLimiter,
  validate(authValidation.loginSchema),
  authController.login
);
router.post(
  '/refresh-token',
  authRateLimiter,
  validate(authValidation.refreshTokenRequestSchema),
  authController.refreshToken
);
router.post(
  '/logout',
  authMiddleware.verifyAccessToken,
  validate(authValidation.logoutSchema),
  authController.logout
);
router.post(
  '/logout-all',
  authMiddleware.verifyAccessToken,
  authController.logoutAllDevices
);
router.post(
  '/change-password',
  authMiddleware.verifyAccessToken,
  validate(authValidation.changePasswordSchema),
  authController.changePassword
);
router.get('/me', authMiddleware.verifyAccessToken, authController.getCurrentUser);

module.exports = router;

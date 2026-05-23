const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// Cấu hình multer để upload avatar
const avatarDir = path.join(__dirname, '../../public/uploads/avatars');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);
    if (extName && mimeType) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed!'));
  },
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
  '/admin/login',
  authRateLimiter,
  validate(authValidation.loginSchema),
  authController.adminLogin
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
router.patch(
  '/change-password',
  authMiddleware.verifyAccessToken,
  validate(authValidation.changePasswordSchema),
  authController.changePassword
);
router.patch(
  '/update-profile',
  authMiddleware.verifyAccessToken,
  validate(authValidation.updateProfileSchema),
  authController.updateProfile
);
router.patch(
  '/update-notifications',
  authMiddleware.verifyAccessToken,
  validate(authValidation.updateNotificationPreferencesSchema),
  authController.updateNotificationPreferences
);
router.patch(
  '/update-preferences',
  authMiddleware.verifyAccessToken,
  validate(authValidation.updatePreferencesSchema),
  authController.updatePreferences
);
router.delete(
  '/delete-account',
  authMiddleware.verifyAccessToken,
  validate(authValidation.deleteAccountSchema),
  authController.deleteAccount
);
router.post(
  '/upload-avatar',
  authMiddleware.verifyAccessToken,
  upload.single('avatar'),
  authController.uploadAvatar
);
router.post(
  '/admins',
  authMiddleware.verifyAccessToken,
  authMiddleware.requireRole('admin'),
  validate(authValidation.createAdminSchema),
  authController.createAdmin
);
router.get('/me', authMiddleware.verifyAccessToken, authController.getCurrentUser);

module.exports = router;

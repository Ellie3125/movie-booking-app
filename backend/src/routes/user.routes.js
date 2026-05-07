const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const userValidation = require('../validations/user.validation');

const router = express.Router();

router.use(authMiddleware.verifyAccessToken);
router.use(authMiddleware.requireRole('admin')); // Only admin can manage users

router.get(
  '/',
  validate(userValidation.listUsersQuerySchema),
  userController.listUsers
);

router.get(
  '/:id',
  validate(userValidation.userIdParamSchema),
  userController.getUserById
);

router.patch(
  '/:id/role',
  validate(userValidation.changeRoleSchema),
  userController.changeRole
);

router.patch(
  '/:id/status',
  validate(userValidation.changeStatusSchema),
  userController.changeStatus
);

module.exports = router;

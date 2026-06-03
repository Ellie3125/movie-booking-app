const express = require('express');
const ticketController = require('../controllers/ticket.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const ticketValidation = require('../validations/ticket.validation');

const router = express.Router();

router.use(authMiddleware.protect);

// Admin routes
router.get(
  '/admin/all',
  authMiddleware.requireRole('admin'),
  ticketController.listTicketsAdmin
);
router.get(
  '/admin/:ticketId',
  authMiddleware.requireRole('admin'),
  ticketController.getTicketByIdAdmin
);
router.post(
  '/admin/:ticketId/use',
  authMiddleware.requireRole('admin'),
  ticketController.markTicketAsUsed
);

// User routes
router.get(
  '/',
  validate({ query: ticketValidation.listTicketsQuerySchema }),
  ticketController.listMyTickets
);
router.get(
  '/:id',
  validate({ params: ticketValidation.ticketIdParamSchema }),
  ticketController.getMyTicketById
);

module.exports = router;

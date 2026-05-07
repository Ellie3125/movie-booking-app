const asyncHandler = require('../utils/asyncHandler');
const sendApiResponse = require('../utils/apiResponse');
const ticketService = require('../services/ticket.service');

const listMyTickets = asyncHandler(async (req, res) => {
  const data = await ticketService.listMyTickets({
    userId: req.user.id,
    bookingId: req.query.bookingId,
    status: req.query.status,
  });

  return sendApiResponse(res, {
    message: 'Tickets fetched successfully',
    data,
  });
});

const getMyTicketById = asyncHandler(async (req, res) => {
  const data = await ticketService.getMyTicketById({
    ticketId: req.params.id,
    userId: req.user.id,
  });

  return sendApiResponse(res, {
    message: 'Ticket fetched successfully',
    data,
  });
});

const listTicketsAdmin = asyncHandler(async (req, res) => {
  const data = await ticketService.listTicketsAdmin({
    status: req.query.status,
    ticketCode: req.query.ticketCode,
    bookingCode: req.query.bookingCode,
  });

  return sendApiResponse(res, {
    message: 'Tickets fetched successfully',
    data,
  });
});

const getTicketByIdAdmin = asyncHandler(async (req, res) => {
  const data = await ticketService.getTicketByIdAdmin(req.params.ticketId);
  return sendApiResponse(res, {
    message: 'Ticket fetched successfully',
    data,
  });
});

const markTicketAsUsed = asyncHandler(async (req, res) => {
  const data = await ticketService.markTicketAsUsed(req.params.ticketId);
  return sendApiResponse(res, {
    message: 'Ticket marked as used successfully',
    data,
  });
});

module.exports = {
  listMyTickets,
  getMyTicketById,
  listTicketsAdmin,
  getTicketByIdAdmin,
  markTicketAsUsed,
};

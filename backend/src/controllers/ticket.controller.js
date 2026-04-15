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

module.exports = {
  listMyTickets,
  getMyTicketById,
};

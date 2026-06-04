const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const ApiError = require('../utils/apiError');
const { sanitizeUserSummary } = require('../utils/userProfile');
const { getSeatDisplayLabel } = require('../utils/seatDisplay');

const TICKET_POPULATE = [
  {
    path: 'bookingId',
    select: 'bookingCode status paymentStatus paymentMethod totalAmount currency paidAt createdAt userId',
    populate: {
      path: 'userId',
      select: 'fullName email phoneNumber avatarUrl role',
    },
  },
  {
    path: 'movieId',
    select: 'title duration poster status',
  },
  {
    path: 'roomId',
    select: 'name roomType totalRows totalColumns',
  },
  {
    path: 'showtimeId',
    select: 'startTime endTime cinemaId',
    populate: {
      path: 'cinemaId',
      select: 'name brand city address',
    },
  },
];

const getTicketQuery = (filter) => {
  const query = Ticket.find(filter).sort({ createdAt: -1 });

  TICKET_POPULATE.forEach((populate) => {
    query.populate(populate);
  });

  return query;
};

const mapTicketResponse = (ticket) => ({
  ticketId: String(ticket._id),
  ticketCode: ticket.ticketCode,
  status: ticket.status,
  price: ticket.price,
  issuedAt: ticket.issuedAt,
  seat: {
    seatCode: ticket.seat.seatCode,
    seatLabel: getSeatDisplayLabel(ticket.seat),
    seatType: ticket.seat.seatType,
  },
  user: sanitizeUserSummary(ticket.bookingId?.userId || ticket.userId),
  booking: ticket.bookingId
    ? {
        id: String(ticket.bookingId._id),
      bookingCode: ticket.bookingId.bookingCode || null,
      status: ticket.bookingId.status,
      paymentStatus: ticket.bookingId.paymentStatus,
      paymentMethod: ticket.bookingId.paymentMethod || null,
      totalAmount: ticket.bookingId.totalAmount,
      totalPrice: ticket.bookingId.totalAmount,
      currency: ticket.bookingId.currency,
      paidAt: ticket.bookingId.paidAt,
        createdAt: ticket.bookingId.createdAt,
      }
    : null,
  movie: ticket.movieId
    ? {
        id: String(ticket.movieId._id),
        title: ticket.movieId.title,
        duration: ticket.movieId.duration,
        poster: ticket.movieId.poster,
        status: ticket.movieId.status,
      }
    : null,
  cinema: ticket.showtimeId?.cinemaId
    ? {
        id: String(ticket.showtimeId.cinemaId._id),
        name: ticket.showtimeId.cinemaId.name,
        brand: ticket.showtimeId.cinemaId.brand,
        city: ticket.showtimeId.cinemaId.city,
        address: ticket.showtimeId.cinemaId.address,
      }
    : null,
  room: ticket.roomId
    ? {
        id: String(ticket.roomId._id),
        name: ticket.roomId.name,
        roomType: ticket.roomId.roomType,
        totalRows: ticket.roomId.totalRows,
        totalColumns: ticket.roomId.totalColumns,
      }
    : null,
  showtime: ticket.showtimeId
    ? {
        id: String(ticket.showtimeId._id),
        startTime: ticket.showtimeId.startTime,
        endTime: ticket.showtimeId.endTime,
      }
    : null,
});

const listMyTickets = async ({ userId, bookingId, status }) => {
  const filter = { userId };

  if (bookingId) {
    filter.bookingId = bookingId;
  }

  if (status) {
    filter.status = status;
  }

  const [items, total] = await Promise.all([
    getTicketQuery(filter).lean().exec(),
    Ticket.countDocuments(filter),
  ]);

  return {
    items: items.map(mapTicketResponse),
    total,
  };
};

const getMyTicketById = async ({ ticketId, userId }) => {
  if (!mongoose.isValidObjectId(ticketId)) {
    throw ApiError.badRequest('Ticket id is invalid', 'INVALID_OBJECT_ID');
  }

  const ticket = await getTicketQuery({ _id: ticketId })
    .limit(1)
    .then((items) => items[0] || null);

  if (!ticket) {
    throw ApiError.notFound('Ticket not found', 'TICKET_NOT_FOUND');
  }

  if (String(ticket.userId) !== String(userId)) {
    throw ApiError.forbidden(
      'You do not have permission to access this ticket',
      'TICKET_ACCESS_DENIED'
    );
  }

  return mapTicketResponse(ticket);
};

const listTicketsAdmin = async ({ status, ticketCode, bookingCode }) => {
  const filter = {};

  if (status) filter.status = status;
  if (ticketCode) filter.ticketCode = { $regex: ticketCode, $options: 'i' };

  // If we need to filter by bookingCode, we might need a join/lookup, but for simplicity, 
  // if bookingCode is passed, we can find the booking first and then filter tickets by bookingId.
  if (bookingCode) {
    const Booking = mongoose.model('Booking');
    const booking = await Booking.findOne({ bookingCode: { $regex: bookingCode, $options: 'i' } }).lean().exec();
    if (booking) {
      filter.bookingId = booking._id;
    } else {
      // If booking not found, return empty array
      return { items: [], total: 0 };
    }
  }

  const [items, total] = await Promise.all([
    getTicketQuery(filter).lean().exec(),
    Ticket.countDocuments(filter),
  ]);

  return {
    items: items.map(mapTicketResponse),
    total,
  };
};

const getTicketByIdAdmin = async (ticketId) => {
  if (!mongoose.isValidObjectId(ticketId)) {
    throw ApiError.badRequest('Ticket id is invalid', 'INVALID_OBJECT_ID');
  }

  const ticket = await getTicketQuery({ _id: ticketId })
    .limit(1)
    .then((items) => items[0] || null);

  if (!ticket) {
    throw ApiError.notFound('Ticket not found', 'TICKET_NOT_FOUND');
  }

  return mapTicketResponse(ticket);
};

const markTicketAsUsed = async (ticketId) => {
  if (!mongoose.isValidObjectId(ticketId)) {
    throw ApiError.badRequest('Ticket id is invalid', 'INVALID_OBJECT_ID');
  }

  const ticket = await Ticket.findById(ticketId).exec();
  if (!ticket) {
    throw ApiError.notFound('Ticket not found', 'TICKET_NOT_FOUND');
  }

  if (ticket.status === 'used') {
    throw ApiError.conflict('Ticket has already been used', 'TICKET_ALREADY_USED');
  }

  if (ticket.status === 'cancelled') {
    throw ApiError.conflict('Cannot use a cancelled ticket', 'TICKET_CANCELLED');
  }

  ticket.status = 'used';
  await ticket.save();

  const freshTicket = await getTicketQuery({ _id: ticket._id })
    .limit(1)
    .then((items) => items[0] || null);

  if (!freshTicket) {
    throw ApiError.notFound('Ticket not found', 'TICKET_NOT_FOUND');
  }

  return mapTicketResponse(freshTicket);
};

module.exports = {
  listMyTickets,
  getMyTicketById,
  listTicketsAdmin,
  getTicketByIdAdmin,
  markTicketAsUsed,
  _private: {
    mapTicketResponse,
  },
};

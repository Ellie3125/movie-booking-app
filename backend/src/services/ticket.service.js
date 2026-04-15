const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const ApiError = require('../utils/apiError');

const TICKET_POPULATE = [
  {
    path: 'bookingId',
    select: 'bookingCode status paymentStatus paymentMethod totalPrice currency paidAt createdAt',
  },
  {
    path: 'movieId',
    select: 'title duration poster status',
  },
  {
    path: 'roomId',
    select: 'name screenLabel totalRows totalColumns',
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
    seatCoordinate: ticket.seat.seatCoordinate,
    seatLabel: ticket.seat.seatLabel,
    seatType: ticket.seat.seatType,
  },
  booking: ticket.bookingId
    ? {
        id: String(ticket.bookingId._id),
        bookingCode: ticket.bookingId.bookingCode || null,
        status: ticket.bookingId.status,
        paymentStatus: ticket.bookingId.paymentStatus,
        paymentMethod: ticket.bookingId.paymentMethod || null,
        totalPrice: ticket.bookingId.totalPrice,
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
        screenLabel: ticket.roomId.screenLabel,
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

module.exports = {
  listMyTickets,
  getMyTicketById,
};

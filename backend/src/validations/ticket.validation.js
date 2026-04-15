const Ticket = require('../models/Ticket');
const { Joi, strictObject, objectId } = require('./common.validation');

const ticketStatusValues = Ticket.schema.path('status').enumValues;

const ticketIdParamSchema = strictObject({
  id: objectId.required().label('id'),
});

const listTicketsQuerySchema = strictObject({
  bookingId: objectId.optional().label('bookingId'),
  status: Joi.string()
    .valid(...ticketStatusValues)
    .optional()
    .label('status'),
});

module.exports = {
  ticketIdParamSchema,
  listTicketsQuerySchema,
};

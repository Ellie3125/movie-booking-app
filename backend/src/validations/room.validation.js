const { Joi, objectId, strictObject } = require('./common.validation');

const seatCoordinateSchema = Joi.string()
  .trim()
  .uppercase()
  .pattern(/^[A-Z]\d+$/)
  .messages({
    'string.pattern.base': 'hiddenCoordinates must use seat coordinates like A1',
  });

const roomIdParamSchema = strictObject({
  id: objectId.required().label('id'),
});

const roomMutationBodySchema = strictObject({
  cinemaId: objectId.required().label('cinemaId'),
  name: Joi.string().trim().min(1).max(120).required().label('name'),
  screenLabel: Joi.string()
    .trim()
    .min(1)
    .max(120)
    .required()
    .label('screenLabel'),
  totalRows: Joi.number().integer().min(1).max(26).required().label('totalRows'),
  totalColumns: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .required()
    .label('totalColumns'),
  hiddenCoordinates: Joi.array()
    .items(seatCoordinateSchema)
    .unique()
    .default([])
    .label('hiddenCoordinates'),
});

module.exports = {
  createRoomSchema: {
    body: roomMutationBodySchema,
  },
  roomIdParamSchema: {
    params: roomIdParamSchema,
  },
  updateRoomSchema: {
    params: roomIdParamSchema,
    body: roomMutationBodySchema,
  },
};

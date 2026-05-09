const { Joi, objectId, strictObject } = require('./common.validation');

const seatCodeSchema = Joi.string()
  .trim()
  .uppercase()
  .pattern(/^[A-Z]\d+$/)
  .messages({
    'string.pattern.base': 'hiddenCoordinates must use seat codes like A1',
  });

const roomIdParamSchema = strictObject({
  id: objectId.required().label('id'),
});

const roomMutationBodySchema = strictObject({
  cinemaId: objectId.required().label('cinemaId'),
  name: Joi.string().trim().min(1).max(120).required().label('name'),
  roomType: Joi.string()
    .valid('standard', 'vip', 'gold', 'imax')
    .default('standard')
    .label('roomType'),
  totalRows: Joi.number().integer().min(1).max(26).label('totalRows'),
  totalColumns: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .label('totalColumns'),
  hiddenCoordinates: Joi.array()
    .items(seatCodeSchema)
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

const { Joi, objectId, strictObject } = require('./common.validation');

const cinemaIdParamSchema = strictObject({
  id: objectId.required().label('id'),
});

const cinemaMutationBodySchema = strictObject({
  brand: Joi.string().required().label('brand'),
  name: Joi.string().trim().min(1).max(180).required().label('name'),
  city: Joi.string().required().label('city'),
  address: Joi.string().trim().min(1).max(500).required().label('address'),
  imageUrl: Joi.string().allow('', null).label('imageUrl'),
  phone: Joi.string().allow('', null).label('phone'),
  latitude: Joi.number().allow(null).default(null).label('latitude'),
  longitude: Joi.number().allow(null).default(null).label('longitude'),
});

module.exports = {
  createCinemaSchema: {
    body: cinemaMutationBodySchema,
  },
  cinemaIdParamSchema: {
    params: cinemaIdParamSchema,
  },
  updateCinemaSchema: {
    params: cinemaIdParamSchema,
    body: cinemaMutationBodySchema,
  },
};

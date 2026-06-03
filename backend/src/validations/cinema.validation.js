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

const updateLocationBodySchema = strictObject({
  lat: Joi.number().min(-90).max(90).required().label('lat'),
  lng: Joi.number().min(-180).max(180).required().label('lng'),
});

const nearbyQuerySchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required().label('lat'),
  lng: Joi.number().min(-180).max(180).required().label('lng'),
  limit: Joi.number().integer().min(1).max(50).default(5).label('limit'),
  maxDistance: Joi.number().integer().min(100).max(100000).default(10000).label('maxDistance'),
}).required();

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
  updateLocationSchema: {
    params: cinemaIdParamSchema,
    body: updateLocationBodySchema,
  },
  nearbyQuerySchema: {
    query: nearbyQuerySchema,
  },
};

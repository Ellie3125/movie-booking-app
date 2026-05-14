const { Joi, objectId, strictObject } = require('./common.validation');

const cinemaBrandMutationBodySchema = strictObject({
  name: Joi.string().trim().min(1).max(100).required().label('name'),
  code: Joi.string().trim().min(1).max(50).required().label('code'),
  logo: Joi.string().allow('', null).label('logo'),
  description: Joi.string().allow('', null).label('description'),
  status: Joi.string().valid('active', 'inactive').default('active').label('status'),
});

module.exports = {
  createBrandSchema: {
    body: cinemaBrandMutationBodySchema,
  },
  updateBrandSchema: {
    params: strictObject({
      id: objectId.required(),
    }),
    body: cinemaBrandMutationBodySchema,
  },
};

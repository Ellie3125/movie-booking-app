const { Joi, objectId, strictObject } = require('./common.validation');

const userIdParamSchema = strictObject({
  id: objectId.required().label('id'),
});

const listUsersQuerySchema = strictObject({
  role: Joi.string().valid('user', 'admin').optional().label('role'),
  isActive: Joi.boolean().optional().label('isActive'),
  search: Joi.string().trim().allow('').optional().label('search'),
});

const changeRoleSchema = strictObject({
  role: Joi.string().valid('user', 'admin').required().label('role'),
});

const changeStatusSchema = strictObject({
  isActive: Joi.boolean().required().label('isActive'),
});

module.exports = {
  userIdParamSchema: {
    params: userIdParamSchema,
  },
  listUsersQuerySchema: {
    query: listUsersQuerySchema,
  },
  changeRoleSchema: {
    params: userIdParamSchema,
    body: changeRoleSchema,
  },
  changeStatusSchema: {
    params: userIdParamSchema,
    body: changeStatusSchema,
  },
};

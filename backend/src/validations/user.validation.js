const { Joi, objectId, strictObject } = require('./common.validation');

const userIdParamSchema = strictObject({
  id: objectId.required().label('id'),
});

const listUsersQuerySchema = strictObject({
  role: Joi.string().valid('user', 'staff', 'admin').optional().label('role'),
  status: Joi.string().valid('active', 'blocked').optional().label('status'),
  search: Joi.string().trim().allow('').optional().label('search'),
});

const changeRoleSchema = strictObject({
  role: Joi.string().valid('user', 'staff', 'admin').required().label('role'),
});

const changeStatusSchema = strictObject({
  status: Joi.string().valid('active', 'blocked').required().label('status'),
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

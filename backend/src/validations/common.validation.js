const Joi = require('joi');

const objectId = Joi.string()
  .trim()
  .pattern(/^[a-fA-F0-9]{24}$/)
  .messages({
    'string.empty': '{#label} is required',
    'string.pattern.base': '{#label} must be a valid ObjectId',
  });

const strictObject = (shape) => Joi.object(shape).required().unknown(false);

module.exports = {
  Joi,
  objectId,
  strictObject,
};

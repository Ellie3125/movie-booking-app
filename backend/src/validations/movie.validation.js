const { Joi, objectId, strictObject } = require('./common.validation');

const movieIdParamSchema = strictObject({
  id: objectId.required().label('id'),
});

const stringListSchema = Joi.array()
  .items(Joi.string().trim().min(1).max(120))
  .default([])
  .label('stringList');

const movieMutationBodySchema = strictObject({
  title: Joi.string().trim().min(1).max(180).required().label('title'),
  description: Joi.string().trim().allow('').max(4000).default('').label('description'),
  duration: Joi.number().integer().min(1).max(600).required().label('duration'),
  genre: stringListSchema.label('genre'),
  poster: Joi.string().trim().allow('').max(12000000).default('').label('poster'),
  releaseDate: Joi.date().iso().required().label('releaseDate'),
  status: Joi.string()
    .trim()
    .valid('now_showing', 'coming_soon', 'ended')
    .required()
    .label('status'),
  language: Joi.string().trim().allow('').max(120).default('Phụ đề').label('language'),
  rating: Joi.string().trim().allow('').max(40).default('T13').label('rating'),
  formats: stringListSchema.label('formats'),
  featuredNote: Joi.string()
    .trim()
    .allow('')
    .max(1000)
    .default('')
    .label('featuredNote'),
});

module.exports = {
  createMovieSchema: {
    body: movieMutationBodySchema,
  },
  movieIdParamSchema: {
    params: movieIdParamSchema,
  },
  updateMovieSchema: {
    params: movieIdParamSchema,
    body: movieMutationBodySchema,
  },
};

const Joi = require('joi');

const schema = Joi.object({
  page: Joi.number().default(1),
  limit: Joi.number()
    .default(20)
    .max(200),
  sortBy: Joi.string()
    .default('timeUpdated')
    .valid('timeUpdate', 'percentDone'),
  sortOrder: Joi.number()
    .default(-1)
    .valid(-1, 1),
  search: Joi.array()
    .items(Joi.string())
    .default([]),
  chapterName: Joi.string(),
  fileName: Joi.string(),
  speakersCount: Joi.number(),
  names: Joi.array()
    .items(Joi.string())
    .default([]),
  namesStrict: Joi.array()
    .items(Joi.string())
    .default([]),
  percentDone: Joi.number(),
  hideCompleted: Joi.bool().default(false),
  hideChanged: Joi.bool().default(false)
}).required();

function findValidation(req, res, next) {
  const { error, value } = Joi.validate(req.query, schema, {
    abortEarly: false
  });

  if (!error) {
    req.query = value;

    return next();
  }

  throw error;
}

module.exports = findValidation;

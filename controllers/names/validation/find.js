const Joi = require('joi');

const schema = Joi.object({
  search: Joi.string(),
  hideCompleted: Joi.bool().default(false)
}).required();

function findValidation(ctx, next) {
  const { request: req } = ctx;

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

const Joi = require('joi');

const schema = Joi.object({
  search: Joi.string(),
  hideCompleted: Joi.bool().default(false)
}).required();

function findValidation(ctx, next) {
  const { error, value } = Joi.validate(ctx.query, schema, {
    abortEarly: false
  });

  if (!error) {
    ctx.state.query = value;

    return next();
  }

  throw error;
}

module.exports = findValidation;

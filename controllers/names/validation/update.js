const Joi = require('joi');

const schema = Joi.object({
  english: Joi.string().required()
}).required();

function updateValidation(ctx, next) {
  const { request } = ctx;

  const { error, value } = Joi.validate(request.body, schema, {
    abortEarly: false
  });

  if (!error) {
    request.body = value;

    return next();
  }

  throw error;
}

module.exports = updateValidation;

const Joi = require('joi');

const schema = Joi.object({
  find: Joi.string().required(),
  replace: Joi.string().required()
}).required();

function replaceValidation(ctx, next) {
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

module.exports = replaceValidation;

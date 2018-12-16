const Joi = require('joi');

const schema = Joi.object({
  find: Joi.string().required(),
  replace: Joi.string().required()
}).required();

function replaceValidation(ctx, next) {
  const { request: req } = ctx;

  const { error, value } = Joi.validate(req.body, schema, {
    abortEarly: false
  });

  if (!error) {
    req.body = value;

    return next();
  }

  throw error;
}

module.exports = replaceValidation;

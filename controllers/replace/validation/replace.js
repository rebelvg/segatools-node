const Joi = require('joi');

const schema = Joi.object({
  find: Joi.string(),
  replace: Joi.string()
}).required();

function replaceValidation(req, res, next) {
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

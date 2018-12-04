const Joi = require('joi');

const schema = Joi.object({
  english: Joi.string().required()
}).required();

function updateValidation(req, res, next) {
  const { error, value } = Joi.validate(req.body, schema, {
    abortEarly: false
  });

  if (!error) {
    req.body = value;

    return next();
  }

  throw error;
}

module.exports = updateValidation;

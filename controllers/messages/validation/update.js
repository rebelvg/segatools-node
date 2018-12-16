const Joi = require('joi');

const schema = Joi.object({
  chapterName: Joi.string(),
  updatedLines: Joi.array()
    .items({
      japanese: Joi.string().required(),
      english: Joi.string().required()
    })
    .min(1)
    .required(),
  updateMany: Joi.boolean().required()
}).required();

function updateValidation(ctx, next) {
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

module.exports = updateValidation;

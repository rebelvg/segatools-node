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

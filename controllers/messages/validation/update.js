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

function updateValidation(req, res, next) {
  const validationResult = Joi.validate(req.body, schema, {
    abortEarly: false
  });

  if (!validationResult.error) {
    return next();
  }

  throw validationResult.error;
}

module.exports = updateValidation;

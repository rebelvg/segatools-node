import * as Joi from 'joi';

const schema = Joi.object({
  chapterName: Joi.string(),
  updatedLines: Joi.array().items({
    japanese: Joi.string().required(),
    english: Joi.string().required()
  }),
  proofRead: Joi.boolean(),
  updateMany: Joi.boolean().required()
}).required();

export function updateValidation(ctx, next) {
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

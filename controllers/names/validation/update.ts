import * as Joi from 'joi';

const schema = Joi.object({
  english: Joi.string()
    .required()
    .allow('')
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

import * as Joi from 'joi';

const schema = Joi.object({
  page: Joi.number().default(1),
  limit: Joi.number()
    .default(20)
    .max(200),
  search: Joi.string()
}).required();

export function findValidation(ctx, next) {
  const { error, value } = Joi.validate(ctx.query, schema, {
    abortEarly: false
  });

  if (!error) {
    ctx.state.query = value;

    return next();
  }

  throw error;
}

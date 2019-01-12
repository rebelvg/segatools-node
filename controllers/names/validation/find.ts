import * as Joi from 'joi';

const schema = Joi.object({
  search: Joi.string(),
  hideCompleted: Joi.bool().default(false)
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

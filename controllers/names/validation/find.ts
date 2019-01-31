import * as Joi from 'joi';

const schema = Joi.object({
  sortBy: Joi.string()
    .default('nameId')
    .valid('nameId', 'timeUpdated'),
  sortOrder: Joi.number()
    .default(-1)
    .valid(-1, 1),
  search: Joi.string(),
  hideCompleted: Joi.bool().default(false),
  hideNotCompleted: Joi.bool().default(false)
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

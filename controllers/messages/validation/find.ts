import * as Joi from 'joi';

const schema = Joi.object({
  page: Joi.number().default(1),
  limit: Joi.number()
    .default(20)
    .max(200),
  sortBy: Joi.string()
    .default('timeUpdated')
    .valid('fileName', 'percentDone', 'timeUpdated'),
  sortOrder: Joi.number()
    .default(-1)
    .valid(-1, 1),
  search: Joi.array()
    .items(Joi.string())
    .default([]),
  searchStrict: Joi.array()
    .items(Joi.string())
    .default([]),
  chapterName: Joi.string(),
  fileName: Joi.string(),
  speakersCount: Joi.number(),
  names: Joi.array()
    .items(Joi.string())
    .default([]),
  namesStrict: Joi.array()
    .items(Joi.string())
    .default([]),
  hideChanged: Joi.bool().default(false),
  hideCompleted: Joi.bool().default(false),
  hideNotCompleted: Joi.bool().default(false),
  proofRead: Joi.boolean()
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

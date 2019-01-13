import * as Joi from 'joi';

import { PersonaEnum } from '../../../../models/user';

const schema = Joi.object({
  personas: Joi.array().items(Joi.string().valid(PersonaEnum.admin, PersonaEnum.editor))
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

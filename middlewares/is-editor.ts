import { Context } from 'koa';
import { PersonaEnum } from '../models/user';

export async function isEditor(ctx: Context, next) {
  const { user } = ctx.state;

  if (!user) {
    throw new Error('Not logged in.');
  }

  if (!user.personas.includes(PersonaEnum.editor)) {
    throw new Error('User is not editor.');
  }

  await next();
}

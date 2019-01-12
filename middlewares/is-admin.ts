import { Context } from 'koa';
import { PersonaEnum } from '../models/user';

export async function isAdmin(ctx: Context, next) {
  const { user } = ctx.state;

  if (!user) {
    throw new Error('Not logged in.');
  }

  if (user.personas.includes(PersonaEnum.admin)) {
    throw new Error('User is not admin.');
  }

  await next();
}

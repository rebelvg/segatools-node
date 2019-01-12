import { Context } from 'koa';
import { User } from '../models/user';

export async function readToken(ctx: Context, next) {
  const { token } = ctx.headers;

  if (token) {
    const user = await User.findOne({
      token
    });

    if (user) {
      ctx.state.user = user;
    }
  }

  await next();
}

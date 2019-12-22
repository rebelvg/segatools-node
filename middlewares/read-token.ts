import { Context } from 'koa';
import { User, IUser } from '../models/user';

/* tslint:disable:interface-name */
declare module 'koa' {
  interface Context {
    state: {
      user: IUser;
      [key: string]: any;
    };
  }
}

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

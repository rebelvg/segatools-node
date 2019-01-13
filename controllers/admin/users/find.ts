import { Context } from 'koa';

import { User } from '../../../models/user';

export async function find(ctx: Context) {
  const users = await User.findAll();

  ctx.body = {
    users
  };
}

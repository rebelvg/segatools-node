import { Context } from 'koa';

import { User } from '../../../models/user';
import { usersCollection } from '../../../mongo';

export async function update(ctx: Context) {
  const {
    params: { id },
    request
  } = ctx;

  const { personas } = request.body;

  const user = await User.findById(id);

  if (!user) {
    throw new Error('User not found.');
  }

  await usersCollection().updateOne(
    { _id: user._id },
    {
      $set: {
        personas: personas || user.personas
      }
    }
  );

  ctx.body = {
    user: await User.findById(id)
  };
}

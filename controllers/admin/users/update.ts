import { Context } from 'koa';

import { User } from '../../../models/user';
import { usersCollection, logsCollection } from '../../../mongo';
import { LogTypeEnum } from '../../../models/logs';

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

  await logsCollection().insertOne({
    type: LogTypeEnum.user,
    content: {
      id,
      personas,
      createdAt: new Date()
    },
    user: user._id,
    createdAt: new Date()
  });

  ctx.body = {
    user: await User.findById(id)
  };
}

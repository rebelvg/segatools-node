import { Context } from 'koa';

import { Name } from '../../models/name';
import { namesCollection, logsCollection } from '../../mongo';
import { LogTypeEnum } from '../../models/logs';

export async function update(ctx: Context, next) {
  const {
    params: { id: nameId },
    request,
    state: { user }
  } = ctx;

  const { english } = request.body;

  const nameRecord = await Name.findById(nameId);

  if (!nameRecord) {
    throw new Error('Name not found.');
  }

  const nameModel = new Name(nameRecord);

  nameModel.update({
    english
  });

  await namesCollection().updateOne(
    { _id: nameRecord._id },
    {
      $set: {
        ...nameModel
      }
    }
  );

  await logsCollection().insertOne({
    type: LogTypeEnum.name,
    content: {
      id: nameId,
      english
    },
    userId: user._id,
    createdAt: new Date()
  });

  ctx.body = {
    name: await Name.findById(nameId)
  };
}

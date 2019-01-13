import { Context } from 'koa';

import { Name } from '../../models/name';
import { namesCollection } from '../../mongo';

export async function update(ctx: Context, next) {
  const { request } = ctx;

  const { id: nameId } = ctx.params;

  const { english } = request.body;

  const nameRecord = await Name.findOne(nameId);

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

  ctx.body = { name: await Name.findOne(nameId) };
}

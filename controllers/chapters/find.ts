import { Context } from 'koa';

import { messagesCollection } from '../../mongo';

export async function find(ctx: Context, next) {
  const chapters = await messagesCollection().distinct('chapterName', {});

  ctx.body = chapters;
}

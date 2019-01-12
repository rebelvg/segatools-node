import * as _ from 'lodash';
import { Context } from 'koa';

import { messagesCollection } from '../../mongo';

export async function unique(ctx: Context, next) {
  const allMessages = await messagesCollection()
    .find()
    .toArray();

  const allLines = [];

  allMessages.forEach(messageRecord => {
    messageRecord.lines.forEach(line => {
      allLines.push(line.text);
    });
  });

  const result = _.uniqBy(allLines, 'japanese');

  ctx.body = result;
}

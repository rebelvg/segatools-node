import * as _ from 'lodash';

import { AppContext, IMessage } from '../../common/app';

export async function unique(ctx: AppContext, next) {
  const { mongoClient } = ctx;

  const messageCollection = mongoClient.collection<IMessage>('messages');

  const allMessages = await messageCollection.find().toArray();

  const allLines = [];

  allMessages.forEach(messageRecord => {
    messageRecord.lines.forEach(line => {
      allLines.push(line.text);
    });
  });

  const result = _.uniqBy(allLines, 'japanese');

  ctx.body = result;
}

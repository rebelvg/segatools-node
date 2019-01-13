import * as _ from 'lodash';
import { Context } from 'koa';

import { Message } from '../../models/message';
import { Name } from '../../models/name';

export async function show(ctx: Context) {
  const allMessages = await Message.findAll();

  let messagesDonePercent = 0;

  _.forEach(allMessages, message => {
    messagesDonePercent += message.percentDone;
  });

  messagesDonePercent = messagesDonePercent / allMessages.length;

  const allNames = await Name.findAll();

  let namesDonePercent = 0;

  _.forEach(allNames, name => {
    if (name.english) {
      namesDonePercent += 100;
    }
  });

  namesDonePercent = namesDonePercent / allNames.length;

  ctx.body = {
    messagesDonePercent,
    namesDonePercent
  };
}

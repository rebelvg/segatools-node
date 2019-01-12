import * as _ from 'lodash';
import { Context } from 'koa';

import { Message } from '../../models/message';
import { messagesCollection } from '../../mongo';

export async function replace(ctx: Context) {
  const { request } = ctx;

  const { find, replace } = request.body;

  const updateResult = {
    messagesUpdated: 0
  };

  const findQuery = {
    'lines.text.english': new RegExp(_.escapeRegExp(find))
  };

  const allMessages = await Message.findAll(findQuery);

  const updateOperations = [];

  for (const messageRecord of allMessages) {
    const messageModel = new Message(messageRecord);

    messageModel.replace({
      find,
      replace
    });

    const updatePromise = messagesCollection().updateOne(
      { _id: messageRecord._id },
      {
        $set: {
          ...messageModel
        }
      }
    );

    updateOperations.push(updatePromise);
  }

  await Promise.all(updateOperations);

  updateResult.messagesUpdated = updateOperations.length;

  ctx.body = updateResult;
}

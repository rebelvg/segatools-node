import { Context } from 'koa';

import { Message, IMessage } from '../../models/message';
import { messagesCollection } from '../../mongo';
import { FilterQuery } from 'mongodb';

export async function update(ctx: Context, next) {
  const { request } = ctx;

  const { updatedLines = [] } = request.body;

  const findQuery: FilterQuery<IMessage> = {
    'lines.text.japanese': {
      $in: updatedLines.map(updateLine => updateLine.japanese)
    },
    proofRead: {
      $ne: true
    }
  };

  const allMessages = await Message.findAll(findQuery);

  const updateOperations = [];

  for (const messageRecord of allMessages) {
    const messageModel = new Message(messageRecord);

    messageModel.update({
      updatedLines
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

  ctx.body = {
    messagesUpdated: updateOperations.length
  };
}

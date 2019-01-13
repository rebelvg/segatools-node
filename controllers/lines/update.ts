import { Context } from 'koa';

import { Message } from '../../models/message';
import { messagesCollection } from '../../mongo';

export async function update(ctx: Context, next) {
  const { request } = ctx;

  const { updatedLines = [] } = request.body;

  const findQuery = {
    'lines.text.japanese': {
      $in: updatedLines.map(updateLine => updateLine.japanese)
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

  ctx.body = { messagesUpdated: updateOperations.length };
}

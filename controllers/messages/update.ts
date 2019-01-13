import { Context } from 'koa';

import { Message } from '../../models/message';
import { messagesCollection } from '../../mongo';

export async function update(ctx: Context, next) {
  const {
    params: { id: messageId },
    request
  } = ctx;

  const { chapterName, updatedLines = [], updateMany = true } = request.body;

  const messageRecordById = await Message.findById(messageId);

  if (!messageRecordById) {
    throw new Error('Message not found.');
  }

  const messageModelById = new Message(messageRecordById);

  messageModelById.update({
    chapterName
  });

  await messagesCollection().updateOne(
    { _id: messageRecordById._id },
    {
      $set: {
        ...messageModelById
      }
    }
  );

  const findQuery = !updateMany
    ? {
        _id: messageRecordById._id
      }
    : {
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

  ctx.body = {
    messagesUpdated: updateOperations.length
  };
}

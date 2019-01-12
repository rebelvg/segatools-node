import { ObjectID } from 'mongodb';
import { Context } from 'koa';

import { Message } from '../../models/message';
import { messagesCollection } from '../../mongo';

export async function update(ctx: Context, next) {
  const { request } = ctx;

  const messageId = ctx.params.id;
  const { chapterName, updatedLines = [], updateMany = true } = request.body;

  const messageRecord = await messagesCollection().findOne({
    _id: new ObjectID(messageId)
  });

  if (!messageRecord) {
    throw new Error('Message not found.');
  }

  const messageModel = new Message(messageRecord);

  messageModel.update({
    chapterName
  });

  await messagesCollection().updateOne(
    { _id: messageRecord._id },
    {
      $set: {
        ...messageModel
      }
    }
  );

  const updateResult = {
    messagesUpdated: 0
  };

  const findQuery = !updateMany
    ? {
        _id: messageRecord._id
      }
    : {
        'lines.text.japanese': {
          $in: updatedLines.map(updateLine => updateLine.japanese)
        }
      };

  const allMessages = await messagesCollection()
    .find(findQuery)
    .toArray();

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

  updateResult.messagesUpdated = updateOperations.length;

  ctx.body = updateResult;
}

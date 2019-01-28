import { Context } from 'koa';

import { Message, IMessage } from '../../models/message';
import { messagesCollection } from '../../mongo';
import { FilterQuery } from 'mongodb';

export async function update(ctx: Context, next) {
  const {
    params: { id: messageId },
    request
  } = ctx;

  const { chapterName, updatedLines = [], proofRead, updateMany = true } = request.body;

  const messageRecordById = await Message.findById(messageId);

  if (!messageRecordById) {
    throw new Error('Message not found.');
  }

  if (chapterName) {
    const chapters: string[] = await messagesCollection().distinct('chapterName', {});

    if (!chapters.includes(chapterName)) {
      throw new Error('Bad chapter name.');
    }
  }

  const messageModelById = new Message(messageRecordById);

  messageModelById.update({
    chapterName,
    proofRead
  });

  await messagesCollection().updateOne(
    { _id: messageRecordById._id },
    {
      $set: {
        ...messageModelById
      }
    }
  );

  const findQuery: FilterQuery<IMessage> = !updateMany
    ? {
        _id: messageRecordById._id
      }
    : {
        $or: [
          {
            _id: messageRecordById._id,
            'lines.text.japanese': {
              $in: updatedLines.map(updateLine => updateLine.japanese)
            }
          },
          {
            'lines.text.japanese': {
              $in: updatedLines.map(updateLine => updateLine.japanese)
            },
            proofRead: {
              $ne: true
            }
          }
        ]
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

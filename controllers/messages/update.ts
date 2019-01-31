import { Context } from 'koa';
import * as _ from 'lodash';

import { Message, IMessage } from '../../models/message';
import { messagesCollection, logsCollection } from '../../mongo';
import { FilterQuery } from 'mongodb';
import { LogTypeEnum } from '../../models/logs';

export async function update(ctx: Context, next) {
  const {
    params: { id: messageId },
    request,
    state: { user }
  } = ctx;

  const { chapterName, updatedLines = [], proofRead } = request.body;

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

  const findQuery: FilterQuery<IMessage> = {
    'lines.text.japanese': {
      $in: updatedLines.map(updateLine => updateLine.japanese)
    },
    $or: [
      {
        _id: messageRecordById._id
      },
      {
        proofRead: {
          $ne: true
        }
      }
    ]
  };

  const allMessages = await Message.findAll(findQuery);

  const updateOperations = await Promise.all(
    allMessages.map(messageRecord => {
      const messageModel = new Message(messageRecord);

      messageModel.update({
        updatedLines
      });

      return messagesCollection().updateOne(
        { _id: messageRecord._id },
        {
          $set: {
            ...messageModel
          }
        }
      );
    })
  );

  await logsCollection().insertOne({
    type: LogTypeEnum.message,
    content: {
      id: messageId,
      chapterName,
      proofRead,
      updatedLines
    },
    userId: user._id,
    createdAt: new Date()
  });

  ctx.body = {
    messagesUpdated: updateOperations.length
  };
}

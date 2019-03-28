import { Context } from 'koa';
import * as _ from 'lodash';

import { Message, IMessage } from '../../models/message';
import { messagesCollection, logsCollection } from '../../mongo';
import { FilterQuery } from 'mongodb';
import { LogTypeEnum } from '../../models/logs';
import { chapters } from '../chapters/data/chapters';

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
    if (!chapters.includes(chapterName)) {
      throw new Error('Bad chapter name.');
    }
  }

  let messagesUpdated = 0;

  const messageModelById = new Message(messageRecordById);

  const messageByIdDiffUpdate = messageModelById.diffUpdate({
    chapterName,
    updatedLines,
    proofRead
  });

  if (messageByIdDiffUpdate) {
    await messagesCollection().updateOne(
      { _id: messageRecordById._id },
      {
        $set: {
          ...messageByIdDiffUpdate
        }
      }
    );

    messagesUpdated++;
  }

  const findQuery: FilterQuery<IMessage> = {
    'lines.text.japanese': {
      $in: updatedLines.map(updateLine => updateLine.japanese)
    },
    _id: {
      $ne: messageRecordById._id
    },
    proofRead: {
      $ne: true
    }
  };

  const allMessages = await Message.findAll(findQuery);

  const updateOperations = await Promise.all(
    allMessages.map(messageRecord => {
      const messageModel = new Message(messageRecord);

      const diffUpdate = messageModel.diffUpdate({ updatedLines });

      if (!diffUpdate) {
        return;
      }

      return messagesCollection().updateOne(
        { _id: messageRecord._id },
        {
          $set: {
            ...diffUpdate
          }
        }
      );
    })
  );

  messagesUpdated += updateOperations.filter(item => !!item).length;

  await logsCollection().insertOne({
    type: LogTypeEnum.message,
    content: {
      id: messageId,
      chapterName,
      proofRead,
      updatedLines,
      messagesUpdated
    },
    userId: user._id,
    createdAt: new Date()
  });

  ctx.body = {
    messagesUpdated
  };
}

import { Context } from 'koa';
import * as _ from 'lodash';

import { Message, IMessage } from '../../models/message';
import { messagesCollection, logsCollection } from '../../mongo';
import { FilterQuery } from 'mongodb';
import { LogTypeEnum } from '../../models/logs';

export async function update(ctx: Context, next) {
  const {
    request,
    state: { user }
  } = ctx;

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
      id: null,
      chapterName: null,
      proofRead: null,
      updatedLines,
      createdAt: new Date()
    },
    user: user._id,
    createdAt: new Date()
  });

  const messagesUpdated = _.reduce(
    updateOperations,
    (sum, n) => {
      return sum + n.modifiedCount;
    },
    0
  );

  ctx.body = {
    messagesUpdated
  };
}

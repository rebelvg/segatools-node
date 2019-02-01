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

  await logsCollection().insertOne({
    type: LogTypeEnum.message,
    content: {
      id: null,
      chapterName: null,
      proofRead: null,
      updatedLines
    },
    userId: user._id,
    createdAt: new Date()
  });

  ctx.body = {
    messagesUpdated: updateOperations.filter(item => !!item).length
  };
}

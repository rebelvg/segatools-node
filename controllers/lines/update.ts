import { Context } from 'koa';
import * as _ from 'lodash';

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

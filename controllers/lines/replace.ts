import * as _ from 'lodash';
import { Context } from 'koa';

import { Message } from '../../models/message';
import { messagesCollection, logsCollection } from '../../mongo';
import { LogTypeEnum } from '../../models/logs';

export async function replace(ctx: Context) {
  const {
    request,
    state: { user }
  } = ctx;

  const { find: findString, replace: replaceString } = request.body;

  const findQuery = {
    'lines.text.english': new RegExp(`\\b${_.escapeRegExp(findString)}\\b`)
  };

  const allMessages = await Message.findAll(findQuery);

  const updateOperations = await Promise.all(
    allMessages.map(messageRecord => {
      const messageModel = new Message(messageRecord);

      const diffUpdate = messageModel.diffReplace({
        find: findString,
        replace: replaceString
      });

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

  const messagesUpdated = updateOperations.filter(item => !!item).length;

  await logsCollection().insertOne({
    type: LogTypeEnum.replace,
    content: {
      find: findString,
      replace: replaceString,
      messagesUpdated
    },
    userId: user._id,
    createdAt: new Date()
  });

  ctx.body = {
    messagesUpdated
  };
}

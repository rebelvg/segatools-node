import * as _ from 'lodash';

import { Message, ILine } from '../../models/message';
import { AppContext, IMessage } from '../../common/app';

export async function replace(ctx: AppContext) {
  const { request, mongoClient } = ctx;

  const { find, replace } = request.body;

  const collection = mongoClient.collection<IMessage>('messages');

  const updateResult = {
    messagesUpdated: 0
  };

  const findQuery = {
    'lines.text.english': new RegExp(_.escapeRegExp(find))
  };

  const allMessages = await collection.find(findQuery).toArray();

  const updateOperations = [];

  for (const messageRecord of allMessages) {
    const messageModel = new Message(messageRecord);

    messageModel.replace({
      find,
      replace
    });

    const updatePromise = collection.updateOne(
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

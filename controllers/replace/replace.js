const _ = require('lodash');
const Message = require('../../models/message');

async function replace(req, res) {
  const mongoClient = req.app.get('mongoClient');

  const { find, replace } = req.body;

  const collection = mongoClient.collection('messages');

  const updateResult = {
    messagesUpdated: 0
  };

  const findQuery = {
    'lines.text.english': new RegExp(find)
  };

  const allMessages = await collection.find(findQuery).toArray();

  const updateOperations = [];

  for (const messageRecord of allMessages) {
    const messageModel = new Message(messageRecord);

    messageModel.replace({
      find,replace
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

  res.send(updateResult);
}

module.exports = replace;

const _ = require('lodash');

async function update(req, res, next) {
  const mongoClient = req.app.get('mongoClient');

  const messageId = req.params.id;
  const { chapterName, englishLines, updateOne } = req.body;

  const collection = mongoClient.collection('messages');

  if (updateOne) {
    await collection.update(
      { _id: messageId },
      {
        $set: {
          chapter: chapterName,
          English: englishLines
        }
      }
    );

    return res.send(null);
  }

  const allMessages = await collection.find().toArray();

  const originalMessage = allMessages.find(message => {
    return message._id === messageId;
  });

  if (!originalMessage) {
    throw new Error('Message not found.');
  }

  const japaneseToEnglishMap = {};

  originalMessage.Japanese.forEach((japaneseLine, index) => {
    const englishLine = englishLines[index];

    if (!englishLine) {
      return;
    }

    japaneseToEnglishMap[japaneseLine] = englishLine;
  });

  const updateOperations = [];

  for (const message of allMessages) {
    const { _id: messageId, Japanese: messageJapaneseLines } = message;

    messageJapaneseLines.forEach((japaneseLine, index) => {
      const japaneseToEnglishLine = japaneseToEnglishMap[japaneseLine];

      if (!japaneseToEnglishLine) {
        return;
      }

      const updatePromise = collection.update(
        { _id: messageId },
        {
          $set: {
            [`English.${index}`]: japaneseToEnglishLine
          }
        }
      );

      updateOperations.push(updatePromise);
    });
  }

  await Promise.all(updateOperations);

  res.send(null);
}

module.exports = update;

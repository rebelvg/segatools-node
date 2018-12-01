const _ = require('lodash');
const { ObjectID } = require('mongodb');

async function findById(req, res, next) {
  const mongoClient = req.app.get('mongoClient');

  const messageId = new ObjectID(req.params.id);

  const messagesCollection = mongoClient.collection('messages');
  const namesCollection = mongoClient.collection('names');

  const messageRecord = await messagesCollection.findOne({
    _id: messageId
  });

  if (!messageRecord) {
    throw new Error('Message not found.');
  }

  const prevMessageRecord = (await messagesCollection
    .find({
      _id: { $lt: messageRecord._id },
      chapterName: messageRecord.chapterName
    })
    .sort({ _id: -1 })
    .limit(1)
    .toArray())[0];

  const nextMessageRecord = (await messagesCollection
    .find({
      _id: { $gt: messageRecord._id },
      chapterName: messageRecord.chapterName
    })
    .sort({ _id: -1 })
    .limit(1)
    .toArray())[0];

  const nameRecords = await namesCollection
    .find({
      $or: messageRecord.nameIds.map(nameId => ({
        nameId
      }))
    })
    .toArray();

  const result = {
    ...messageRecord,
    names: messageRecord.nameIds.map(nameId => {
      return _.find(nameRecords, { nameId }) || null;
    }),
    prevMessageId: _.get(prevMessageRecord, '_id', null),
    nextMessageId: _.get(nextMessageRecord, '_id', null),
    percentDone: messageRecord.percentDone,
    timeUpdated: messageRecord.timeUpdated
  };

  res.send(result);
}

module.exports = findById;

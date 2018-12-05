const fs = require('fs');
const _ = require('lodash');
const { MongoClient } = require('mongodb');
const { ObjectID } = require('mongodb');

const Message = require('../models/message');

const mongoUrl = 'mongodb://localhost';
const dbName = 'segatools';

const importedMessagesData = require('./import/messagesEncount.json');

(async () => {
  const mongoClient = await MongoClient.connect(
    mongoUrl,
    { useNewUrlParser: true }
  );

  const db = mongoClient.db(dbName);

  const messagesCollection = db.collection('messages');

  const importPromises = _.map(importedMessagesData, message => {
    const lines = [];

    _.forEach(message.Japanese, (japaneseLine, index) => {
      let speakerId = null;
      if (japaneseLine !== '') {
        speakerId = 113;
      }
      lines.push({
        text: {
          japanese: japaneseLine || null,
          english: message.English[index] || null
        },
        speakerId: speakerId || null
      });
    });

    const messageModel = new Message({
      fileName: message.Filename,
      chapterName: 'Random Encounters',
      lines,
      nameIds: 113,
      timeUpdated: new Date(message.timestamp * 1000)
    });

    return messagesCollection.insertOne({
      ...messageModel,
      _id: new ObjectID(message._id['$id'])
    });
  });

  await Promise.all(importPromises);

  console.log('import done.');

  await mongoClient.close();
})();

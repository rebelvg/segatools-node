const fs = require('fs');
const _ = require('lodash');
const { MongoClient } = require('mongodb');
const { ObjectID } = require('mongodb');

const mongoUrl = 'mongodb://localhost';
const dbName = 'segatools';

const importedMessagesData = require('./import/messages.json');
const importedSpeakersData = require('./import/speakers.json');

(async () => {
  const mongoClient = await MongoClient.connect(mongoUrl);

  const db = mongoClient.db(dbName);

  const messagesCollection = db.collection('messages');

  const importPromises = _.map(importedMessagesData, async (message, index) => {
    const lines = [];

    const speakers = _.find(importedSpeakersData, ['FileName', message.Filename]).NameIDs;

    _.forEach(message.Japanese, (japaneseLine, index) => {
      lines.push({
        text: {
          japanese: japaneseLine,
          english: message.English[index]
        },
        speakerId: speakers[index]
      });
    });

    return messagesCollection.insertOne({
      _id: message._id,
      fileName: message.Filename,
      lines: lines,
      nameIDs: message.nameIDs,
      timeUpdated: message.timestamp
    });
  });

  await Promise.all(importPromises);

  console.log('imported messages');

  await mongoClient.close();
})();

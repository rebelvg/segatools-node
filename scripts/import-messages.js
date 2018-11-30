const fs = require('fs');
const _ = require('lodash');
const { MongoClient } = require('mongodb');
const { ObjectID } = require('mongodb');

const mongoUrl = 'mongodb://localhost';
const dbName = 'segatools';

const importedMessagesData = require('./import/messages.json');
const importedSpeakersData = require('./import/speakers.json');

(async () => {
  const mongoClient = await MongoClient.connect(
    mongoUrl,
    { useNewUrlParser: true }
  );

  const db = mongoClient.db(dbName);

  const messagesCollection = db.collection('messages');

  const importPromises = _.map(importedMessagesData, async message => {
    const lines = [];

    const speakerIds = _.find(importedSpeakersData, ['FileName', message.Filename]).NameIDs;

    _.forEach(message.Japanese, (japaneseLine, index) => {
      lines.push({
        text: {
          japanese: japaneseLine || null,
          english: message.English[index] || null
        },
        speakerId: speakerIds[index]
      });
    });

    return messagesCollection.insertOne({
      _id: new ObjectID(message._id['$id']),
      fileName: message.Filename,
      lines: lines,
      nameIds: message.nameIDs,
      timeUpdated: new Date(message.timestamp * 1000)
    });
  });

  await Promise.all(importPromises);

  console.log('imported done.');

  await mongoClient.close();
})();

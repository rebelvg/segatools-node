import * as _ from 'lodash';
import { MongoClient, ObjectID } from 'mongodb';

import { Message } from '../models/message';

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

  const importPromises = _.map(importedMessagesData, message => {
    const lines = [];

    const speakerIds = _.find<any>(importedSpeakersData, { FileName: message.Filename }).NameIDs;

    _.forEach(message.Japanese, (japaneseLine, index) => {
      lines.push({
        text: {
          japanese: japaneseLine || null,
          english: message.English[index] || null
        },
        speakerId: speakerIds[index]
      });
    });

    const messageModel = new Message({
      fileName: message.Filename,
      chapterName: message.chapter,
      lines,
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

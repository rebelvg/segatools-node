import * as _ from 'lodash';
import { MongoClient, ObjectID } from 'mongodb';

import { Message } from '../models/message';

const mongoUrl = 'mongodb://localhost';
const dbName = 'segatools';

const importedMessagesData = require('./import/messages-encounters.json');

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
      lines.push({
        text: {
          japanese: japaneseLine || null,
          english: message.English[index] || null
        },
        speakerId: japaneseLine ? 113 : null
      });
    });

    const messageModel = new Message({
      fileName: message.Filename,
      chapterName: 'Random Encounters',
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

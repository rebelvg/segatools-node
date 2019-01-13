import * as _ from 'lodash';
import { MongoClient, ObjectID } from 'mongodb';

import { Message, IMessage, ILine } from '../models/message';

const mongoUrl = 'mongodb://localhost/';
const dbName = 'segatools';

interface IMessageImport {
  _id: {
    $id: string;
  };
  Filename: string;
  Japanese: string[];
  English: string[];
  nameIDs: number[];
  timestamp: number;
  log: {
    [key: string]: string;
  };
}

interface IMessagesImport {
  [id: string]: IMessageImport;
}

/* tslint:disable:no-var-requires */
const importedMessagesData: IMessagesImport = require('./import/messages-encounters.json');

(async () => {
  const mongoClient = await MongoClient.connect(
    mongoUrl,
    { useNewUrlParser: true }
  );

  const db = mongoClient.db(dbName);

  const messagesCollection = db.collection<IMessage>('messages');

  const importPromises = _.map(importedMessagesData, message => {
    const lines: ILine[] = [];

    _.forEach(message.Japanese, (japaneseLine, index) => {
      let count = 0;

      _.forEach(importedMessagesData, messageCount => {
        _.forEach(messageCount.Japanese, countJapaneseLine => {
          if (countJapaneseLine === japaneseLine) {
            count++;
          }
        });
      });

      lines.push({
        text: {
          japanese: japaneseLine || null,
          english: message.English[index] || null
        },
        speakerId: japaneseLine ? 113 : null,
        count
      });
    });

    const messageModel = new Message({
      fileName: message.Filename,
      chapterName: 'Random Encounter',
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

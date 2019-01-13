import * as _ from 'lodash';
import { MongoClient, ObjectID } from 'mongodb';

import { Message, ILine, IMessage } from '../models/message';

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
  chapter: string;
  timestamp: number;
  log: {
    [key: string]: string;
  };
}

interface IMessagesImport {
  [id: string]: IMessageImport;
}

interface ISpeakerImport {
  FileName: string;
  Messages: string[];
  NameIDs: number[];
}

/* tslint:disable:no-var-requires */
const importedMessagesData: IMessagesImport = require('./import/messages.json');
const importedSpeakersData: ISpeakerImport[] = require('./import/speakers.json');

(async () => {
  const mongoClient = await MongoClient.connect(
    mongoUrl,
    { useNewUrlParser: true }
  );

  const db = mongoClient.db(dbName);

  const messagesCollection = db.collection<IMessage>('messages');

  const importPromises = _.map(importedMessagesData, message => {
    const lines: ILine[] = [];

    const speakerIds = _.find(importedSpeakersData, { FileName: message.Filename }).NameIDs;

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
        speakerId: speakerIds[index],
        count
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

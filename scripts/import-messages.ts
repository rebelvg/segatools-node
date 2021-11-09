import * as _ from 'lodash';
import { ObjectID } from 'mongodb';

import { Message, ILine } from '../src/models/message';
import { messagesCollection } from '../src/mongo';

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

const allMessages: IMessageImport[] = [];

/* tslint:disable:no-var-requires */
const importedMessagesData: IMessagesImport = require('./import/messages.json');
const importedMessagesEncountersData: IMessagesImport = require('./import/messages-encounters.json');
const importedSpeakersData: ISpeakerImport[] = require('./import/speakers.json');

_.forEach(importedMessagesData, message => {
  allMessages.push(message);
});

_.forEach(importedMessagesEncountersData, message => {
  importedSpeakersData.push({
    FileName: message.Filename,
    Messages: message.Japanese,
    NameIDs: message.Japanese.map(line => (line ? 113 : null))
  });

  allMessages.push({
    ...message,
    chapter: 'Random Encounter',
    nameIDs: [113]
  });
});

export async function importMessages() {
  try {
    await messagesCollection().drop();
  } catch (error) {
    console.log('messages collection does not exist.', error.message);
  }

  const importPromises = _.map(allMessages, message => {
    const lines: ILine[] = [];

    const speakerIds = _.find(importedSpeakersData, { FileName: message.Filename }).NameIDs;

    _.forEach(message.Japanese, (japaneseLine, index) => {
      let count = 0;

      _.forEach(allMessages, messageCount => {
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
      chapterName: message.chapter || 'No Chapter',
      lines,
      proofRead: false,
      timeUpdated: new Date(message.timestamp * 1000)
    });

    return messagesCollection().insertOne({
      ...messageModel,
      _id: new ObjectID(message._id['$id']),
      timeCreated: new Date(),
      linesCount: 0
    });
  });

  await Promise.all(importPromises);

  console.log('messages import done.');
}

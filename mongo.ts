import { MongoClient, Db } from 'mongodb';

import { IMessage } from './models/message';
import { IName } from './models/name';

let mongoClient: Db;

export async function getMongoClient(): Promise<void> {
  return new Promise(resolve => {
    MongoClient.connect(
      'mongodb://localhost/',
      { useNewUrlParser: true },
      (err, client) => {
        if (err) {
          throw err;
        }

        mongoClient = client.db('segatools');

        return resolve();
      }
    );
  });
}

export const messagesCollection = () => mongoClient.collection<IMessage>('messages');
export const namesCollection = () => mongoClient.collection<IName>('names');

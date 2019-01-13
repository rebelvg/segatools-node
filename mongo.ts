import { MongoClient, Db } from 'mongodb';

import { config } from './config';
import { IMessage } from './models/message';
import { IName } from './models/name';
import { IUser } from './models/user';

let mongoClientDb: Db;

export async function getMongoClient(): Promise<void> {
  return new Promise(resolve => {
    MongoClient.connect(
      'mongodb://localhost/',
      { useNewUrlParser: true },
      (err, client) => {
        if (err) {
          throw err;
        }

        mongoClientDb = client.db(config.db.name);

        return resolve();
      }
    );
  });
}

export const messagesCollection = () => mongoClientDb.collection<IMessage>('messages');
export const namesCollection = () => mongoClientDb.collection<IName>('names');
export const usersCollection = () => mongoClientDb.collection<IUser>('users');

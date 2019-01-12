import { Context } from 'koa';
import { Db, ObjectID } from 'mongodb';
import { ILine } from '../models/message';

export interface AppContext extends Context {
  mongoClient: Db;
}

export interface IMessage {
  _id: ObjectID;
  fileName: string;
  chapterName: string;
  lines: ILine[];
  nameIds: number[];
  percentDone: number;
  timeUpdated: Date;
}

export interface IName {
  _id: ObjectID;
  nameId: number;
  japanese: string;
  english: string;
  timeUpdated: Date;
}

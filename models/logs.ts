import { ObjectID } from 'mongodb';
import { ITextLine } from './message';

export enum LogTypeEnum {
  message = 'message',
  name = 'name',
  user = 'user'
}

interface ILogMessage {
  id: string;
  chapterName: string;
  proofRead: boolean;
  updatedLines: ITextLine[];
  createdAt: Date;
}

interface ILogName {
  id: string;
  english: string;
}

interface ILogUser {
  id: string;
  personas: string[];
}

export interface ILog {
  type: LogTypeEnum;
  content: ILogMessage | ILogName | ILogUser;
  user: ObjectID;
  createdAt: Date;
}

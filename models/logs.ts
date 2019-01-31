import { ObjectID } from 'mongodb';
import { ITextLine } from './message';

export enum LogTypeEnum {
  message = 'message',
  name = 'name',
  user = 'user',
  replace = 'replace'
}

interface ILogMessage {
  id: string;
  chapterName: string;
  proofRead: boolean;
  updatedLines: ITextLine[];
}

interface ILogName {
  id: string;
  english: string;
}

interface ILogUser {
  id: string;
  personas: string[];
}

interface ILogReplace {
  find: string;
  replace: string;
}

export interface ILog {
  type: LogTypeEnum;
  content: ILogMessage | ILogName | ILogUser | ILogReplace;
  userId: ObjectID;
  createdAt: Date;
}

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
  messagesUpdated: number;
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
  messagesUpdated: number;
}

export interface ILog {
  type: LogTypeEnum;
  content: ILogMessage | ILogName | ILogUser | ILogReplace;
  userId: ObjectID;
  createdAt: Date;
}

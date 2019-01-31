import { ObjectID } from 'mongodb';
import { ITextLine } from './message';

export enum LogTypeEnum {
  message = 'message',
  name = 'name'
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

export interface ILog {
  type: LogTypeEnum;
  content: ILogMessage | ILogName;
  user: ObjectID;
  createdAt: Date;
}

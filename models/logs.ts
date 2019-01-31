import { ObjectID } from 'mongodb';

export enum LogTypeEnum {
  message = 'message',
  name = 'name'
}

export interface ILog {
  type: LogTypeEnum;
  content: any;
  user: ObjectID;
  createdAt: Date;
}

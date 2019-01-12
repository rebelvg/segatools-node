import { Context } from 'koa';
import { Db } from 'mongodb';

export interface AppContext extends Context {
  mongoClient: Db;
}

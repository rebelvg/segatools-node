import { ObjectID, FilterQuery } from 'mongodb';
import * as uuid from 'uuid/v4';

import { usersCollection } from '../mongo';

export enum PersonaEnum {
  admin = 'admin',
  editor = 'editor'
}

export interface IUser {
  _id?: ObjectID;
  emails: IUserEmail[];
  googleId: string;
  name: string;
  personas: PersonaEnum[];
  token: string;
  ipCreated: string;
  ipUpdated: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IUserEmail {
  value: string;
  type?: string;
}

export class User {
  public _id: ObjectID;
  public emails: IUserEmail[];
  public googleId: string;
  public name: string;
  public personas: PersonaEnum[];
  public token: string;
  public ipCreated: string;
  public ipUpdated: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor({
    emails,
    googleId,
    name,
    ipCreated
  }: {
    emails: IUserEmail[];
    googleId: string;
    name: string;
    ipCreated: string;
  }) {
    this.emails = emails;
    this.googleId = googleId;
    this.name = name;
    this.personas = [];
    this.token = uuid();
    this.ipCreated = ipCreated;
    this.ipUpdated = this.ipCreated;
    this.createdAt = new Date();
    this.updatedAt = this.createdAt;
  }

  public static findAll(query: FilterQuery<IUser> = {}): Promise<IUser[]> {
    return usersCollection()
      .find(query)
      .sort({
        createdAt: -1
      })
      .toArray();
  }

  public static findOne(query): Promise<IUser> {
    return usersCollection().findOne(query);
  }

  public static findById(id: string): Promise<IUser> {
    return usersCollection().findOne({
      _id: new ObjectID(id)
    });
  }

  public static async findByGoogleId(googleId: string): Promise<IUser> {
    return usersCollection().findOne({
      googleId
    });
  }
}

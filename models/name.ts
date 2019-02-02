import { ObjectID, FilterQuery } from 'mongodb';

import { namesCollection } from '../mongo';

export interface IName {
  _id: ObjectID;
  nameId: number;
  japanese: string;
  english: string;
  linesCount: number;
  timeCreated: Date;
  timeUpdated: Date;
}

export class Name {
  public nameId: number;
  public japanese: string;
  public english: string;
  public timeUpdated: Date;

  constructor({
    nameId,
    japanese,
    english,
    timeUpdated
  }: {
    nameId: number;
    japanese: string;
    english: string;
    timeUpdated: Date;
  }) {
    this.nameId = nameId;
    this.japanese = japanese;
    this.english = english;
    this.timeUpdated = timeUpdated;
  }

  public static findAll(query: FilterQuery<IName> = {}, sort = {}): Promise<IName[]> {
    return namesCollection()
      .find(query)
      .sort(sort)
      .toArray();
  }

  public static findById(id: string): Promise<IName> {
    return namesCollection().findOne({
      _id: new ObjectID(id)
    });
  }

  public update({ english }: { english: string }): void {
    this.english = english;
    this.timeUpdated = new Date();
  }
}

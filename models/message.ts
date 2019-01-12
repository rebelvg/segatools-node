import * as _ from 'lodash';
import { ObjectID, FilterQuery } from 'mongodb';

import { messagesCollection } from '../mongo';

export interface IMessage {
  _id: ObjectID;
  fileName: string;
  chapterName: string;
  lines: ILine[];
  nameIds: number[];
  percentDone: number;
  timeUpdated: Date;
}

export interface ILine {
  text: ITextLine;
  speakerId: number;
}

export interface ITextLine {
  japanese: string;
  english: string;
}

export class Message {
  public fileName: string;
  public chapterName: string;
  public lines: ILine[];
  public nameIds: number[];
  public percentDone: number;
  public timeUpdated: Date;

  constructor({
    fileName,
    chapterName,
    lines,
    timeUpdated
  }: {
    fileName: string;
    chapterName: string;
    lines: ILine[];
    timeUpdated: Date;
  }) {
    this.fileName = fileName;
    this.chapterName = chapterName || 'No Chapter';
    this.lines = lines;
    this.nameIds = this.getNameIds(lines);
    this.percentDone = this.getPercent(lines);
    this.timeUpdated = timeUpdated;
  }

  public static findAll(query: FilterQuery<IMessage> = {}): Promise<IMessage[]> {
    return messagesCollection()
      .find(query)
      .toArray();
  }

  public static findOne(id: string): Promise<IMessage> {
    return messagesCollection().findOne({
      _id: new ObjectID(id)
    });
  }

  public update({ chapterName, updatedLines }: { chapterName?: string; updatedLines?: ITextLine[] }): void {
    this.chapterName = chapterName || this.chapterName;

    _.forEach(this.lines, line => {
      _.forEach(updatedLines, updatedLine => {
        if (line.text.japanese !== updatedLine.japanese) {
          return;
        }

        line.text.english = updatedLine.english;
      });
    });

    this.percentDone = this.getPercent(this.lines);
    this.timeUpdated = new Date();
  }

  public replace({ find, replace }: { find: string; replace: string }): void {
    _.forEach(this.lines, line => {
      if (!_.includes(line.text.english, find)) {
        return;
      }

      line.text.english = _.replace(line.text.english, find, replace);
    });
  }

  private getNameIds(lines: ILine[]): number[] {
    const nameIds: number[] = [];

    lines.forEach(line => {
      nameIds.push(line.speakerId);
    });

    return _.uniq(_.without(nameIds, null));
  }

  private getPercent(lines: ILine[]): number {
    const japaneseLines = _.filter(lines, line => {
      return !!line.text.japanese;
    });

    const englishLines = _.filter(lines, line => {
      return !!line.text.english;
    });

    return (englishLines.length / japaneseLines.length || 0) * 100;
  }
}

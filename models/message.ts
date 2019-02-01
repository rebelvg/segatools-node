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
  proofRead: boolean;
  timeCreated: Date;
  timeUpdated: Date;
}

export interface ILine {
  text: ITextLine;
  speakerId: number;
  count: number;
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
  public proofRead: boolean = false;
  public timeUpdated: Date;

  constructor({
    fileName,
    chapterName,
    lines,
    proofRead,
    timeUpdated
  }: {
    fileName: string;
    chapterName: string;
    lines: ILine[];
    proofRead: boolean;
    timeUpdated: Date;
  }) {
    this.fileName = fileName;
    this.chapterName = chapterName;
    this.lines = lines;
    this.nameIds = this.getNameIds(lines);
    this.percentDone = this.getPercent(lines);
    this.proofRead = proofRead;
    this.timeUpdated = timeUpdated;
  }

  public static findAll(query: FilterQuery<IMessage> = {}): Promise<IMessage[]> {
    return messagesCollection()
      .find(query)
      .toArray();
  }

  public static findById(id: string): Promise<IMessage> {
    return messagesCollection().findOne({
      _id: new ObjectID(id)
    });
  }

  public update({
    chapterName,
    updatedLines,
    proofRead
  }: {
    chapterName?: string;
    updatedLines?: ITextLine[];
    proofRead?: boolean;
  }): void {
    this.chapterName = chapterName || this.chapterName;

    _.forEach(this.lines, line => {
      _.forEach(updatedLines, updatedLine => {
        if (line.text.japanese !== updatedLine.japanese) {
          return;
        }

        line.text.english = updatedLine.english;
      });
    });

    this.proofRead = proofRead === undefined ? proofRead : this.proofRead;
    this.percentDone = this.getPercent(this.lines);
    this.timeUpdated = new Date();
  }

  public diffUpdate({
    chapterName,
    updatedLines,
    proofRead
  }: {
    chapterName?: string;
    updatedLines?: ITextLine[];
    proofRead?: boolean;
  }) {
    const diffUpdate: any = {};

    if (chapterName !== undefined && chapterName !== this.chapterName) {
      diffUpdate['chapterName'] = chapterName;
    }

    _.forEach(this.lines, (line, index) => {
      _.forEach(updatedLines, updatedLine => {
        if (line.text.japanese !== updatedLine.japanese) {
          return;
        }

        if (line.text.english === updatedLine.english) {
          return;
        }

        diffUpdate[`lines.${index}.text.english`] = updatedLine.english;

        line.text.english = updatedLine.english;
      });
    });

    if (proofRead !== undefined && proofRead !== this.proofRead) {
      diffUpdate['proofRead'] = proofRead;
    }

    return !_.isEmpty(diffUpdate)
      ? {
          ...diffUpdate,
          percentDone: this.getPercent(this.lines),
          timeUpdated: new Date()
        }
      : null;
  }

  public replace({ find, replace }: { find: string; replace: string }): void {
    _.forEach(this.lines, line => {
      if (!_.includes(line.text.english, find)) {
        return;
      }

      line.text.english = _.replace(line.text.english, find, replace);
    });

    this.timeUpdated = new Date();
  }

  public diffReplace({ find, replace }: { find: string; replace: string }) {
    const diffUpdate: any = {};

    _.forEach(this.lines, (line, index) => {
      if (!_.includes(line.text.english, find)) {
        return;
      }

      const newEnglishLine = _.replace(line.text.english, find, replace);

      if (line.text.english !== newEnglishLine) {
        diffUpdate[`lines.${index}.text.english`] = newEnglishLine;
      }
    });

    return !_.isEmpty(diffUpdate)
      ? {
          ...diffUpdate,
          timeUpdated: new Date()
        }
      : null;
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

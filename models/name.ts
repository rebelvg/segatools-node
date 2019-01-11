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

  public update({ english }: { english: string }): void {
    this.english = english;
    this.timeUpdated = new Date();
  }
}

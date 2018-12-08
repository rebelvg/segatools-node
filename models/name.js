class Name {
  constructor({ nameId, japanese, english, timeUpdated }) {
    this.nameId = nameId;
    this.japanese = japanese;
    this.english = english;
    this.timeUpdated = timeUpdated;
  }

  update({ english }) {
    this.english = english;
    this.timeUpdated = new Date();
  }
}

module.exports = Name;

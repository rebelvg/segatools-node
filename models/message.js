const _ = require('lodash');

class Message {
  constructor({ fileName, lines, timeUpdated }) {
    this.fileName = fileName;
    this.lines = lines;
    this.nameIds = this._getNameIds(lines);
    this.percentDone = this._getPercent(lines);
    this.timeUpdated = timeUpdated;
  }

  _getNameIds(lines) {
    const nameIds = [];

    lines.forEach(line => {
      nameIds.push(line.speakerId);
    });

    return _.uniq(_.without(nameIds, null));
  }

  _getPercent(lines) {
    const japaneseLines = _.filter(lines, line => {
      return !!line.text.japanese;
    });

    const englishLines = _.filter(lines, line => {
      return !!line.text.english;
    });

    return (englishLines.length / japaneseLines.length || 0) * 100;
  }
}

module.exports = Message;

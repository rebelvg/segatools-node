const _ = require('lodash');

class Message {
  constructor({ fileName, chapterName, lines, timeUpdated }) {
    this.fileName = fileName;
    this.chapterName = chapterName || 'No Chapter';
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

  update({ chapterName, updatedLines }) {
    this.chapterName = chapterName || this.chapterName;

    _.forEach(this.lines, line => {
      _.forEach(updatedLines, updatedLine => {
        if (line.text.japanese !== updatedLine.japanese) {
          return;
        }

        line.text.english = updatedLine.english;
      });
    });

    this.percentDone = this._getPercent(this.lines);
    this.timeUpdated = new Date();
  }
}

module.exports = Message;

import * as _ from 'lodash';
import { Context } from 'koa';

import { Message, ILine } from '../../models/message';
import { Name } from '../../models/name';

export async function get(ctx: Context) {
  const allMessages = await Message.findAll();

  let messagesDonePercent = 0;

  _.forEach(allMessages, message => {
    messagesDonePercent += message.percentDone;
  });

  messagesDonePercent = messagesDonePercent / allMessages.length;

  const allLines: ILine[] = [];

  allMessages.forEach(messageRecord => {
    messageRecord.lines.forEach(line => {
      if (!line.text.japanese) {
        return;
      }

      allLines.push(line);
    });
  });

  const allJapaneseLines: ILine[] = [];

  allLines.forEach(line => {
    if (!line.text.japanese) {
      return;
    }

    allJapaneseLines.push(line);
  });

  const uniqueJapaneseLines = _.uniqBy(allJapaneseLines, 'text.japanese');

  const allEnglishLines: ILine[] = [];

  allLines.forEach(line => {
    if (!line.text.english) {
      return;
    }

    allEnglishLines.push(line);
  });

  const uniqueEnglishLines = _.uniqBy(allJapaneseLines, 'text.english');

  const allNames = await Name.findAll();

  const allEnglishNames = allNames.filter(name => {
    return !!name.english;
  });

  let namesDonePercent = 0;

  _.forEach(allNames, name => {
    if (name.english) {
      namesDonePercent += 100;
    }
  });

  namesDonePercent = namesDonePercent / allNames.length;

  ctx.body = {
    messages: {
      filesCount: allMessages.length,
      total: allJapaneseLines.length,
      translated: allEnglishLines.length,
      totalUnique: uniqueJapaneseLines.length,
      translatedUnique: uniqueEnglishLines.length,
      percentDone: (uniqueEnglishLines.length / uniqueJapaneseLines.length) * 100
    },
    names: {
      filesCount: allNames.length,
      total: allNames.length,
      translated: allEnglishNames.length,
      percentDone: (allEnglishNames.length / allNames.length) * 100
    },
    percentDone:
      ((uniqueEnglishLines.length + allEnglishNames.length) / (uniqueJapaneseLines.length + allNames.length)) * 100
  };
}

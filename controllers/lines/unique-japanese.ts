import * as _ from 'lodash';
import { Context } from 'koa';

import { Message, ILine, IMessage } from '../../models/message';

export async function uniqueJapanese(ctx: Context, next) {
  const { page = 1, limit = 20, search } = ctx.state.query;

  const allMessages = await Message.findAll();

  const allLines: ILine[] = [];

  allMessages.forEach(messageRecord => {
    messageRecord.lines.forEach(line => {
      allLines.push(line);
    });
  });

  let uniqueLines = _.uniqBy(allLines, 'text.japanese');

  if (search) {
    const searchRegexp = new RegExp(`\\b${_.escapeRegExp(search)}\\b`);

    uniqueLines = _.filter(uniqueLines, (line: ILine) => {
      return searchRegexp.test(line.text.japanese);
    });
  }

  const filteredLines = _.filter(uniqueLines, line => {
    return line.text.japanese && !line.text.english;
  });

  const sortedLines = _.sortBy(filteredLines, 'count');

  const info = {
    page,
    pages: _.ceil(filteredLines.length / limit),
    limit,
    total: filteredLines.length
  };

  const lines = _.slice(sortedLines.reverse(), (page - 1) * limit, page * limit).map(line => _.omit(line, 'speakerId'));

  ctx.body = {
    lines,
    ...info
  };
}

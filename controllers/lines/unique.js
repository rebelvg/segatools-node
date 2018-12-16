const _ = require('lodash');

async function find(ctx, next) {
  const { mongoClient } = ctx;

  const messageCollection = mongoClient.collection('messages');

  const allMessages = await messageCollection.find().toArray();

  const allLines = [];

  allMessages.forEach(messageRecord => {
    messageRecord.lines.forEach(line => {
      allLines.push(line.text);
    });
  });

  const result = _.uniqBy(allLines, 'japanese');

  ctx.body = result;
}

module.exports = find;

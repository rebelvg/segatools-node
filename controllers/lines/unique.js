const _ = require('lodash');

async function find(req, res, next) {
  const mongoClient = req.app.get('mongoClient');

  const messageCollection = mongoClient.collection('messages');

  const allMessages = await messageCollection.find().toArray();

  const allLines = [];

  allMessages.forEach(messageRecord => {
    messageRecord.lines.forEach(line => {
      allLines.push(line.text);
    });
  });

  const result = _.uniqBy(allLines, 'japanese');

  res.send(result);
}

module.exports = find;

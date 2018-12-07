const _ = require('lodash');
const { inspect } = require('util');

async function find(req, res, next) {
  const mongoClient = req.app.get('mongoClient');

  const messageCollection = mongoClient.collection('messages');

  const allMessages = await messageCollection.find().toArray();

  const allLines = [];
  allMessages.map(messageFile => {
    messageFile.lines.map(line => {
      {
        allLines.push(line.text);
      }
    });
  });

  let result = _.uniqBy(allLines, 'japanese');

  res.send(result);
}

module.exports = find;

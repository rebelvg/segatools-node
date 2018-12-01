const _ = require('lodash');

async function findById(req, res, next) {
  const mongoClient = req.app.get('mongoClient');

  const cursor = mongoClient.collection('messages');
  let ObjectID = require('mongodb').ObjectID;
  const searchID = new ObjectID(req.params.id);
  let idMessage = await cursor.findOne({
    _id: searchID
  });
  
  if (!idMessage) {
    throw new Error('Message not found.');
  }

  let prev_id = await cursor
    .find({ 
      '_id': {'$lt': searchID},
      'chapterName':idMessage.chapterName
    })
    .sort({'_id': -1})
    .limit(1)
    .toArray();

  let next_id = await cursor
    .find({ 
      '_id': {'$gt': searchID},
      'chapterName':idMessage.chapterName
    })
    .sort({'_id': 1})
    .limit(1)
    .toArray();

  if (prev_id[0] !== undefined) {
    prev_id=prev_id[0]._id;
  } else {
    prev_id = null;
  }
  if (next_id[0] !== undefined) {
    next_id=next_id[0]._id;
  } else {
    next_id = null;
  }

  const names = await mongoClient
    .collection('names')
    .find()
    .toArray();

  const result = {
    _id: searchID,
    fileName: idMessage.fileName,
    chapterName: idMessage.chapterName,
    lines: idMessage.lines.map(line =>
    {
      return {
        text: line.text, 
        speakerName: `${
          (line.speakerId !== null) ? 
            `${names[line.speakerId].Japanese}${
              (names[line.speakerId].English) ? 
                ` (${names[line.speakerId].English
                })` : `` 
            }`: `System`
        }`
      };
    }),
    names: idMessage.nameIds.map(name =>
    {
      return `${
        (name !== null) ? 
          `${names[name].Japanese}${
            (names[name].English) ? 
              ` (${names[name].English
              })` : `` 
          }`:''
      }`;
    }),
    prev_id: prev_id,
    next_id: next_id,
    percentDone: idMessage.percentDone,
    timeUpdated: idMessage.timeUpdated
  };
  
  res.send(result);
}

module.exports = findById;

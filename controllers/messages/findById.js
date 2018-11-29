const _ = require('lodash');

async function findById(req, res, next) {
  const mongoClient = req.app.get('mongoClient');

  const cursor = mongoClient.collection('messages');
  let ObjectID = require('mongodb').ObjectID;
  const ID = new ObjectID(req.params.id);
  const allmessages = await cursor
    .find()
    .sort({ _id: 1 })
    .toArray();
  const idmessage = allmessages.findIndex(function(element) {
    return element._id === req.params.id;
  });

  let result;

  if (idmessage !== -1) {
    let messagesCountArray = [];
    let idarray = [];
    result = allmessages[idmessage];
    //loop through all messages and count how many times each one appear
    for (let i = 0; i < result.Japanese.length; i++) {
      let messageCount = 0;
      allmessages.forEach(function(file) {
        file.Japanese.forEach(function(messinfile) {
          if (messinfile === result.Japanese[i]) {
            messageCount++;
          }
        });
        if (file.chapter === result.chapter && i === 0) {
          idarray.push(file._id);
        } //get ids of all files from a chapter with file once
      });
      messagesCountArray.push(i + ' / ' + messageCount);
    }
    result.count = messagesCountArray;
    //add previous and next id in chapter
    let currentid = idarray.indexOf(result._id);
    if (currentid > 0) {
      result.prev_id = idarray[currentid - 1];
    }
    if (currentid < idarray.length - 1) {
      result.next_id = idarray[currentid + 1];
    }
    const names = await mongoClient
      .collection('names')
      .find()
      .toArray();
    result.names = result.nameIDs.map(function(name) {
      let Englishname = '';
      if (names[name].English) {
        Englishname = ' (' + names[name].English + ')';
      }
      return names[name].Japanese + Englishname;
    });
    result.SpeakerName = result.Speaker.map(function(name) {
      let fullnames = '';
      if (name !== null) {
        let Englishname = '';
        if (names[name].English) {
          Englishname = ' (' + names[name].English + ')';
        }
        fullnames = names[name].Japanese + Englishname;
      }
      return fullnames;
    });
    result.progress = parseFloat(
      ((result.English.filter(e => e !== null).length * 100) / result.Japanese.filter(e => e !== '').length).toFixed(1)
    );
  }
  res.send(result);
}

module.exports = findById;

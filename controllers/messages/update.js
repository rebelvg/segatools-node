const _ = require('lodash');

async function update(req, res, next) {
  const mongoClient = req.app.get('mongoClient');

  const cursor = mongoClient.collection('messages');
  let ObjectID = require('mongodb').ObjectID;
  const ID = new ObjectID(req.params.id);
  const TimeOfChange = 'log.' + Math.round(new Date() / 1000).toString();
  cursor.update(
    { _id: ID },
    {
      $set: {
        chapter: req.body.chapter,
        timestamp: Math.round(new Date() / 1000),
        [TimeOfChange]: req.raw.ip.toString()
      }
    }
  );
  if (req.body.onlythisfile === true) {
    cursor.update(
      { _id: ID },
      {
        $set: {
          English: req.body.English
        }
      }
    );
  } else {
    const allmessages = await cursor.find().toArray();
    const idmessage = await allmessages.findIndex(function(element) {
      return element._id === req.params.id;
    });
    let ChangedFile = allmessages[idmessage];
    for (let i = 0; i < ChangedFile.Japanese.length; i++) {
      if (ChangedFile.Japanese[i] && req.body.English[i]) {
        allmessages.forEach(function(file) {
          for (let m = 0; m < file.Japanese.length; m++) {
            if (file.Japanese[m]) {
              if (file.Japanese[m] === ChangedFile.Japanese[i] && req.body.English[i] !== file.English[m]) {
                cursor.update(
                  { _id: file._id },
                  {
                    $set: {
                      ['English.' + m]: req.body.English[i]
                    }
                  }
                );
              }
            }
          }
        });
      }
    }
  }

  res.send('replaced');
}

module.exports = update;

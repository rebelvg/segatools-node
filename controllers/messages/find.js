const _ = require('lodash');
const { ObjectID } = require('mongodb');

async function find(req, res, next) {
  const mongoClient = req.app.get('mongoClient');

  const limit = _.toInteger(req.query.limit) || 10;
  const page = _.toInteger(req.query.page) || 1;

  const messagesCollection = mongoClient.collection('messages');
  const namesCollection = mongoClient.collection('names');

  const nameRecords = await namesCollection
    .find()
    .toArray();

  const sortingString = !req.query.sortBy
    ? 'timeUpdated'
    : req.query.sortBy;

  const sortOrder = !req.query.ascOrder
    ? -1
    : 1;

  let query = { $and: [] };
  
  if (req.query.search) {
    const searchRegex = new RegExp(
      _.escapeRegExp(req.query.search)
        .replace(/^/i, '(?=.*')
        .replace(/\s/g, ')(?=.*')
        .replace(/$/i, ')'),
      'i'
    );

    query['$and'].push({
      lines: {
        $elemMatch: {
          $or: [
            { 'text.english': searchRegex },
            { 'text.japanese': searchRegex }
          ]
        }
      }
    });
  }

  if (req.query.chapter) {
    query['$and'].push({ 
      chapter: req.query.chapter 
    });
  } 

  if (req.query.fileName) {
    query['$and'].push({
      fileName: new RegExp(_.escapeRegExp(req.query.fileName), 'i')
    });
  }

  if (req.query.speakers_count) {
    query['$and'].push({
      nameIDs: { $size: _.toInteger(req.query.speakersCount) }
    });
  }

  if (req.query.names) {
    req.query.names.forEach( nameToFind => {
      let speakersArray = { $or: [] };
      let nameRegex = new RegExp(nameToFind.replace(/^\s/g, '').replace(/\s$/g, ''), 'i');

      for (let i = 0; i < nameRecords.length; i++) {
        if (
          nameRegex.test(nameRecords[i].english) ||
          nameRegex.test(nameRecords[i].japanese)
        ) {
          speakersArray['$or'].push({ nameIds: i });
        }
      }
      query['$and'].push(speakersArray);
    });
  }

  if (req.query.hideCompleted) {
    query['$and'].push(
      {percentDone: {$lt: 100}}
    );
  }
  if (req.query.hideChanged) {
    query['$and'].push(
      {percentDone: 0}
    );
  }

  if (query['$and'].length === 0) {
    query = {};
  }

  let messageRecords = await messagesCollection.find(query);
  const count = await messageRecords.count();
  messageRecords = await messageRecords
    .sort({
      [sortingString]: sortOrder
    })
    .skip(limit * (page - 1) - (page - 1))
    .limit(limit)
    .toArray();

  const result = messageRecords.map(file => {
    return {...file,
      names: file.nameIds.map(nameId => {
        return _.find(nameRecords, { nameId }) || null;
      })
    };
  });
  
  const info = {
    current_page: page,
    all_pages: _.ceil(count / limit),
    all_results: count
  };

  res.send({ info, query, messages: result });
}

module.exports = find;

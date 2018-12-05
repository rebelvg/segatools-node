const _ = require('lodash');
const { ObjectID } = require('mongodb');
const { inspect } = require('util');

async function find(req, res, next) {
  const mongoClient = req.app.get('mongoClient');

  const {
    page = 1,
    limit = 20,
    sortBy = 'timeUpdated',
    sortOrder = -1,
    search = [],
    chapterName,
    fileName,
    speakersCount,
    names = [],
    namesStrict = [],
    percentDone,
    hideCompleted,
    hideChanged
  } = req.query;

  const messagesCollection = mongoClient.collection('messages');
  const namesCollection = mongoClient.collection('names');

  let query = { $and: [] };

  if (search.length > 0) {
    const searchRegexp = new RegExp(
      `${search
        .map(_.escapeRegExp)
        .map(search => `(?=.*${search})`)
        .join('')}.+`
    );

    query['$and'].push({
      $or: [
        {
          'lines.text.japanese': {
            $regex: searchRegexp,
            $options: 'ism'
          }
        },
        {
          'lines.text.english': {
            $regex: searchRegexp,
            $options: 'ism'
          }
        }
      ]
    });
  }

  if (chapterName) {
    query['$and'].push({
      chapterName
    });
  }

  if (fileName) {
    query['$and'].push({
      fileName: new RegExp(_.escapeRegExp(fileName), 'i')
    });
  }

  if (speakersCount !== undefined) {
    query['$and'].push({
      nameIds: { $size: speakersCount }
    });
  }

  if (names.length > 0) {
    await Promise.all(
      names.map(async name => {
        const nameIdsToFind = await namesCollection.distinct('nameId', {
          $or: [
            {
              japanese: new RegExp(_.escapeRegExp(name), 'i')
            },
            {
              english: new RegExp(_.escapeRegExp(name), 'i')
            }
          ]
        });

        query['$and'].push({
          $or: nameIdsToFind.map(nameId => ({ nameIds: nameId }))
        });
      })
    );
  }

  if (namesStrict.length > 0) {
    await Promise.all(
      namesStrict.map(async name => {
        const nameIdsToFind = await namesCollection.distinct('nameId', {
          $or: [
            {
              japanese: _.escapeRegExp(namesStrict)
            },
            {
              english: _.escapeRegExp(namesStrict)
            }
          ]
        });

        query['$and'].push({
          $or: nameIdsToFind.map(nameId => ({ nameIds: nameId }))
        });
      })
    );
  }

  if (percentDone !== undefined) {
    query['$and'].push({ percentDone });
  }

  if (hideCompleted) {
    query['$and'].push({ percentDone: { $lt: 100 } });
  }

  if (hideChanged) {
    query['$and'].push({ percentDone: 0 });
  }

  if (query['$and'].length === 0) {
    query = {};
  }

  console.log(inspect(query, { showHidden: false, depth: null }));

  const messageRecords = await messagesCollection
    .find(query)
    .sort({
      [sortBy]: sortOrder
    })
    .skip(limit * (page - 1))
    .limit(limit)
    .toArray();

  const nameRecords = await namesCollection.find().toArray();

  const messages = messageRecords.map(file => {
    return {
      ...file,
      names: file.nameIds.map(nameId => {
        return _.find(nameRecords, { nameId }) || null;
      })
    };
  });

  const count = await messagesCollection.countDocuments(query);

  const info = {
    page,
    pages: _.ceil(count / limit),
    limit,
    total: count
  };

  res.send({ messages, ...info });
}

module.exports = find;

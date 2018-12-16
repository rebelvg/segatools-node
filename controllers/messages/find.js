const _ = require('lodash');
const { inspect } = require('util');

async function find(ctx, next) {
  const mongoClient = ctx.mongoClient;

  const {
    page = 1,
    limit = 20,
    sortBy = 'timeUpdated',
    sortOrder = -1,
    search = [],
    searchStrict = [],
    chapterName,
    fileName,
    speakersCount,
    names = [],
    namesStrict = [],
    percentDone,
    hideChanged = false,
    hideCompleted = false,
    hideNotCompleted = false
  } = ctx.state.query;

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

  if (searchStrict.length > 0) {
    searchStrict.forEach(strictLine => {
      query['$and'].push({
        $or: [
          {
            'lines.text.japanese': strictLine
          },
          {
            'lines.text.english': strictLine
          }
        ]
      });
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
              japanese: name
            },
            {
              english: name
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

  if (hideChanged) {
    query['$and'].push({ percentDone: 0 });
  }

  if (hideCompleted) {
    query['$and'].push({ percentDone: { $lt: 100 } });
  }

  if (hideNotCompleted) {
    query['$and'].push({ percentDone: 100 });
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

  ctx.body = { messages, ...info };
}

module.exports = find;

const _ = require('lodash');
const { inspect } = require('util');

async function find(req, res, next) {
  const mongoClient = req.app.get('mongoClient');

  const { search, hideCompleted = false } = req.query;

  const namesCollection = mongoClient.collection('names');

  const searchRegex = new RegExp(_.escapeRegExp(search), 'i');

  const query = {
    $and: [
      {
        $or: [{ japanese: searchRegex }, { english: searchRegex }]
      }
    ]
  };

  if (hideCompleted) {
    query['$and'].push({ english: '' });
  }

  const result = await namesCollection.find(query).toArray();

  console.log(inspect(query, { showHidden: false, depth: null }));

  res.send({ names: result });
}

module.exports = find;

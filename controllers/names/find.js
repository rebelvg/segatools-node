const _ = require('lodash');
const { inspect } = require('util');

async function find(req, res, next) {
  const mongoClient = req.app.get('mongoClient');

  const namesCollection = mongoClient.collection('names');

  const searchRegex = new RegExp(_.escapeRegExp(req.query.search), 'i');

  let query = {
    $and: [
      {
        $or: [{ english: searchRegex }, { japanese: searchRegex }]
      }
    ]
  };

  if (req.query.hideCompleted) {
    query['$and'].push({ english: '' });
  }

  const result = await namesCollection.find(query).toArray();

  console.log(inspect(query, { showHidden: false, depth: null }));

  res.send({ names: result });
}

module.exports = find;

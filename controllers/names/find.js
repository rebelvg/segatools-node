const _ = require('lodash');

async function find(req, res, next) {
  const mongoClient = req.app.get('mongoClient');
  const cursor = mongoClient.collection('names');
  const searchregex = new RegExp(_.escapeRegExp(req.query.search), 'i');
  let query = {$and: [
    { $or: [
      { English: searchregex }, 
      { Japanese: searchregex }
    ]}
  ]};
  if (req.query.hideCompleted) {query['$and'].push({English: ''});}
  const result = await cursor
    .find(query)
    .toArray();
  res.send({ names: result });
}

module.exports = find;

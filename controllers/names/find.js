const _ = require('lodash');

async function find(req, res, next) {
  const mongoClient = req.app.get('mongoClient');

  const cursor = mongoClient.collection('names'); //connect to collection
  const searchregex = new RegExp(_.escapeRegExp(req.query.search), 'i');
  const result = await cursor
    .find({ $or: [{ English: searchregex }, { Japanese: searchregex }] })
    .sort({ timestamp: -1 })
    .toArray();
  res.send({ names: result }); // send result
}

module.exports = find;

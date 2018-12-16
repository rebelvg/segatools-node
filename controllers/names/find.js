const _ = require('lodash');
const { inspect } = require('util');

async function find(ctx, next) {
  const { mongoClient } = ctx;

  const { search, hideCompleted = false } = ctx.state.query;

  const namesCollection = mongoClient.collection('names');

  let query = { $and: [] };

  if (search) {
    const searchRegex = new RegExp(_.escapeRegExp(search), 'i');

    query['$and'].push({
      $or: [{ japanese: searchRegex }, { english: searchRegex }]
    });
  }

  if (hideCompleted) {
    query['$and'].push({ english: '' });
  }

  if (query['$and'].length === 0) {
    query = {};
  }

  console.log(inspect(query, { showHidden: false, depth: null }));

  const result = await namesCollection.find(query).toArray();

  ctx.body = { names: result };
}

module.exports = find;

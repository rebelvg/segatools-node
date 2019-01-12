import * as _ from 'lodash';
import { inspect } from 'util';
import { AppContext, IName } from '../../common/app';

export async function find(ctx: AppContext, next) {
  const { mongoClient } = ctx;

  const { search, hideCompleted = false } = ctx.state.query;

  const namesCollection = mongoClient.collection<IName>('names');

  let query: any = { $and: [] };

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

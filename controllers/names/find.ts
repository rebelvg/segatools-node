import * as _ from 'lodash';
import { inspect } from 'util';
import { Context } from 'koa';

import { namesCollection } from '../../mongo';

export async function find(ctx: Context, next) {
  const { search, hideCompleted = false } = ctx.state.query;

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

  const result = await namesCollection()
    .find(query)
    .toArray();

  ctx.body = { names: result };
}

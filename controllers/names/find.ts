import * as _ from 'lodash';
import { inspect } from 'util';
import { Context } from 'koa';

import { Name } from '../../models/name';

export async function find(ctx: Context, next) {
  const { sortBy, sortOrder, nameId, search, hideCompleted = false, hideNotCompleted = false } = ctx.state.query;

  let query: any = { $and: [] };

  if (nameId !== undefined) {
    query['$and'].push({
      nameId
    });
  }

  if (search) {
    const searchRegex = new RegExp(_.escapeRegExp(search), 'i');

    query['$and'].push({
      $or: [{ japanese: searchRegex }, { english: searchRegex }]
    });
  }

  if (hideCompleted) {
    query['$and'].push({ english: '' });
  }

  if (hideNotCompleted) {
    query['$and'].push({
      english: {
        $ne: ''
      }
    });
  }

  if (query['$and'].length === 0) {
    query = {};
  }

  const names = await Name.findAll(query, {
    [sortBy]: sortOrder
  });

  ctx.body = {
    names
  };
}

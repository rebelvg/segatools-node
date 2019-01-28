import * as _ from 'lodash';
import { Context } from 'koa';

import { namesCollection, messagesCollection } from '../../mongo';
import { Name } from '../../models/name';

export async function find(ctx: Context, next) {
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
    hideChanged = false,
    hideCompleted = false,
    hideNotCompleted = false
  } = ctx.state.query;

  let query: any = { $and: [] };

  if (search.length > 0) {
    const searchRegexp = new RegExp(
      `${search
        .map(_.escapeRegExp)
        .map(searchString => `(?=.*${searchString})`)
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
        const nameIdsToFind = await namesCollection().distinct('nameId', {
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
        const nameIdsToFind = await namesCollection().distinct('nameId', {
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

  const messageRecords = await messagesCollection()
    .find(query)
    .sort({
      [sortBy]: sortOrder
    })
    .skip(limit * (page - 1))
    .limit(limit)
    .toArray();

  const nameRecords = await Name.findAll();

  const messages = messageRecords.map(file => {
    return {
      ...file,
      names: file.nameIds.map(nameId => {
        return _.find(nameRecords, { nameId }) || null;
      })
    };
  });

  const count = (await messagesCollection().countDocuments(query)) as any;

  const chapters = await messagesCollection().distinct('chapterName', {});

  const info = {
    page,
    pages: _.ceil(count / limit),
    limit,
    total: count
  };

  ctx.body = {
    messages,
    chapters,
    ...info
  };
}

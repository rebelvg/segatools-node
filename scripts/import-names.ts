import * as _ from 'lodash';
import { ObjectID } from 'mongodb';

import { namesCollection } from '../src/mongo';

/* tslint:disable:no-var-requires */
const importedNamesData = require('./import/names.json');

export async function importNames() {
  try {
    await namesCollection().drop();
  } catch (error) {
    console.log('names collection does not exist.', error.message);
  }

  const importPromises = _.map(importedNamesData, name => {
    return namesCollection().insertOne({
      nameId: name.nameID,
      japanese: name.Japanese,
      english: name.English || '',
      timeUpdated: new Date(name.timestamp * 1000),
      _id: new ObjectID(name._id['$id']),
      timeCreated: new Date(),
      linesCount: 0
    });
  });

  await Promise.all(importPromises);

  console.log('names import done.');
}

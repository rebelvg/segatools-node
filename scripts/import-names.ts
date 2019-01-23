import * as _ from 'lodash';
import { MongoClient, ObjectID } from 'mongodb';

import { config } from '../config';

const mongoUrl = 'mongodb://localhost/';
const dbName = config.db.name;

/* tslint:disable:no-var-requires */
const importedNamesData = require('./import/names.json');

(async () => {
  const mongoClient = await MongoClient.connect(
    mongoUrl,
    { useNewUrlParser: true }
  );

  const db = mongoClient.db(dbName);

  const namesCollection = db.collection('names');

  await namesCollection.drop();

  const importPromises = _.map(importedNamesData, name => {
    return namesCollection.insertOne({
      nameId: name.nameID,
      japanese: name.Japanese,
      english: name.English,
      timeUpdated: new Date(name.timestamp * 1000),
      _id: new ObjectID(name._id['$id'])
    });
  });

  await Promise.all(importPromises);

  console.log('names import done.');

  await mongoClient.close();
})();

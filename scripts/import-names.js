const fs = require('fs');
const _ = require('lodash');
const { MongoClient } = require('mongodb');
const { ObjectID } = require('mongodb');

const mongoUrl = 'mongodb://localhost';
const dbName = 'segatools';

const importedNamesData = require('./import/names.json');

(async () => {
  const mongoClient = await MongoClient.connect(
    mongoUrl,
    { useNewUrlParser: true }
  );

  const db = mongoClient.db(dbName);

  const namesCollection = db.collection('names');

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

  console.log('import done.');

  await mongoClient.close();
})();

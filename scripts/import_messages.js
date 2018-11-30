const fs = require('fs');
const _ = require('lodash');
const MongoClient = require('mongodb').MongoClient;
const objectID = require('mongodb').ObjectID;
const url = 'mongodb://localhost';
const dbName = 'segatools';
const folder = './import';

MongoClient.connect(
  url,
  async function(err, client) {
    console.log('Connected successfully to server');
    const db = client.db(dbName);

    const collection = db.collection('messages');
    const importedData = require('./import/messages.json');
    const importedNames = require('./import/speakers.json');

    Object.values(importedData).map(async (item, i) => {
      let lines = [];
      const Speaker = _.find(importedNames, ['FileName', item.Filename]).NameIDs;
      Object.values(item.Japanese).map(async (line, message) => {
        lines.push({
          Japanese: line,
          English: item.English[message],
          Speaker: Speaker[message]
        });
      });
      await collection.insertOne({
        _id: objectID(item._id['$id']),
        Filename: item.Filename,
        Lines: lines,
        nameIDs: item.nameIDs,
        timestamp: item.timestamp
      });
    });

    console.log('imported messages');
    client.close();
  }
);

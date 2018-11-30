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

    const collection = db.collection('names');
    const importedData = require('./import/names.json');
    let jsonready = [];
    Object.values(importedData).map(async item => await jsonready.push({ ...item, _id: objectID(item._id['$id']) }));

    await collection.insert(jsonready);
    console.log('imported');

    client.close();
  }
);

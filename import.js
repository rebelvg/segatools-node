const fs = require('fs')

const MongoClient = require('mongodb').MongoClient;
const objectID = require('mongodb').ObjectID
const url = 'mongodb://localhost';
const dbName = 'segatools'
const folder = './import'

MongoClient.connect(url, async function(err, client) {
  console.log("Connected successfully to server");
  const db = client.db(dbName);

  fs.readdir(folder, (err, files) => {
    files.forEach(file => {
      const collection = db.collection(file.replace('.json', ''));
      const importedData = require('./import/'+file)
      Object.values(importedData).map(async (item) => {
        await collection.insertOne({...item, '_id': objectID(item._id['$id'])})
      });
      console.log(`imported ${file}`)
    });

    client.close()
  })
});
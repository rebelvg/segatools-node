const fs = require('fs');
const _ = require('lodash');
const MongoClient = require('mongodb').MongoClient;
const objectID = require('mongodb').ObjectID;
const url = 'mongodb://localhost';
const dbName = 'segatools';
const folder = './import';

MongoClient.connect(url, async function(err, client) {
  console.log('Connected successfully to server');
  const db = client.db(dbName);

  fs.readdir(folder, (err, files) => {
    files.forEach(file => {
      if ((file == 'names.json') || (file == 'messages.json')) {
        const collection = db.collection(file.replace('.json', ''));
        const importedData = require('./import/' + file);
        var jsonready = [];
        Object.values(importedData).map(async(item) => await jsonready.push({...item, '_id': objectID(item._id['$id']) }));
        if (file == 'messages.json') {
          const importednames = require('./import/namemess.json');
          jsonready.forEach(Mfile => {
            if (typeof Mfile.English == 'object') Mfile.English = [...Array(Mfile.Japanese.length)].map((v, i) => Mfile.English[i] || null);
            if (!Mfile.chapter) Mfile.chapter = 'No Chapter';
            for (let i = 0; i < importednames.length; i++) {
              if (Mfile.Filename == importednames[i].FileName) {
                Mfile.Speaker = importednames[i].NameIDs;
                break;
              }
            }
            for (let i = 0; i < Mfile.Speaker.length; i++) {
              if ((Mfile.Japanese[i] === '') && (Mfile.Speaker[i] != null)) Mfile.Speaker[i] = null;
            }

          });
        }
        collection.insert(jsonready);
        console.log('imported');
      }
    });
    client.close();
  });
});

const fs = require('fs')
const _ = require('lodash')
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
            const importedData = require('./import/' + file)
            var jsonready = []
            Object.values(importedData).map(async (item) => jsonready.push({...item, '_id': objectID(item._id['$id'])}))
            if (file == "messages.json")
            {
                jsonready.forEach(Mfile =>
                {
                    if (typeof Mfile.English == 'object')
                        Mfile.English = [...Array(Mfile.Japanese.length)].map((v, i) => Mfile.English[i] || null)
                })
            }
                collection.insert(jsonready)
                console.log(`imported ${file}`)
           });
            client.close()
        })
    })

const { MongoClient } = require('mongodb');

const app = require('./app');

MongoClient.connect(
  'mongodb://localhost/',
  { useNewUrlParser: true },
  (err, client) => {
    if (err) {
      throw err;
    }

    app.set('mongoClient', client.db('segatools'));
  }
);

const { MongoClient } = require('mongodb');

const app = require('./app');

MongoClient.connect(
  'mongodb://localhost/',
  { useNewUrlParser: true },
  (err, client) => {
    if (err) {
      throw err;
    }

    app.context.mongoClient = client.db('segatools');
  }
);

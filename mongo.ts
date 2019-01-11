import { MongoClient } from 'mongodb';

import { app } from './app';

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

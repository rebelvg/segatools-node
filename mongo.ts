import { MongoClient, Db } from 'mongodb';

export async function getMongoClient(): Promise<Db> {
  return new Promise(resolve => {
    MongoClient.connect(
      'mongodb://localhost/',
      { useNewUrlParser: true },
      (err, client) => {
        if (err) {
          throw err;
        }

        return resolve(client.db('segatools'));
      }
    );
  });
}

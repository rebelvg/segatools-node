import { app } from './app';

import { getMongoClient } from './mongo';

process.on('unhandledRejection', (reason, p) => {
  throw reason;
});

(async () => {
  const mongoClient = await getMongoClient();

  app.context.mongoClient = mongoClient;

  app.listen(3000, () => {
    console.log('server is running.');
  });
})();

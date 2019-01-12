import { app } from './app';
import { getMongoClient } from './mongo';

process.on('unhandledRejection', (reason, p) => {
  throw reason;
});

(async () => {
  await getMongoClient();

  app.listen(3000, () => {
    console.log('server is running.');
  });
})();

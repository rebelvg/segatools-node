import { app } from './app';
import { getMongoClient } from './mongo';
import './passport';

import { env } from './env';

process.on('unhandledRejection', (reason, p) => {
  throw reason;
});

(async () => {
  await getMongoClient();

  app.listen(env.SERVER.PORT, () => {
    console.log('server is running...');
  });
})();

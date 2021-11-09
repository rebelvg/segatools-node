import { app } from './app';
import { getMongoClient } from './mongo';
import './passport';

import { CONFIG } from './config';

process.on('unhandledRejection', (reason, p) => {
  throw reason;
});

(async () => {
  await getMongoClient();

  app.listen(CONFIG.SERVER.port, () => {
    console.log('server is running...');
  });
})();

import { app } from './app';
import { getMongoClient } from './mongo';
import './passport';

import { config } from './config';

process.on('unhandledRejection', (reason, p) => {
  throw reason;
});

(async () => {
  await getMongoClient();

  app.listen(config.server.port, config.server.host, () => {
    console.log('server is running...');
  });
})();

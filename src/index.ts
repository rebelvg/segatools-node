import { app } from './app';
import { getMongoClient } from './mongo';
import './passport';
import * as fs from 'fs';

import { env } from './env';

process.on('unhandledRejection', (reason, p) => {
  throw reason;
});

// remove previous unix socket
if (typeof env.SERVER.PORT === 'string') {
  if (fs.existsSync(env.SERVER.PORT)) {
    fs.unlinkSync(env.SERVER.PORT);
  }
}

(async () => {
  await getMongoClient();

  app.listen(env.SERVER.PORT, () => {
    console.log('server is running...');

    // set unix socket rw rights for nginx
    if (typeof env.SERVER.PORT === 'string') {
      fs.chmodSync(env.SERVER.PORT, '777');
    }
  });
})();

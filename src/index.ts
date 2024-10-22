import { app } from './app';
import { getMongoClient, messagesCollection, namesCollection } from './mongo';
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

  new Promise(async () => {
    while (true) {
      fs.writeFileSync(
        `./backup/${Date.now()}.json`,
        JSON.stringify(
          {
            message: await messagesCollection()
              .find()
              .toArray(),
            names: await namesCollection()
              .find()
              .toArray()
          },
          null,
          2
        )
      );

      await new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000));
    }
  });

  app.listen(env.SERVER.PORT, () => {
    console.log('server is running...');

    // set unix socket rw rights for nginx
    if (typeof env.SERVER.PORT === 'string') {
      fs.chmodSync(env.SERVER.PORT, '777');
    }
  });
})();

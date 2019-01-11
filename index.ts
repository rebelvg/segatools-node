import { app } from './app';

import './mongo';

process.on('unhandledRejection', (reason, p) => {
  throw reason;
});

app.listen(3000, () => {
  console.log('server is running.');
});

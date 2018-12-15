const app = require('./app');
require('./mongo');

process.on('unhandledRejection', (reason, p) => {
  throw reason;
});

app.listen(3000, () => {
  console.log('server is running.');
});

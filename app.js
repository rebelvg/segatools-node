const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

const messages = require('./routes/messages');
const names = require('./routes/names');
const lines = require('./routes/lines');

app.use('/api/messages', messages);
app.use('/api/names', names);
app.use('/api/lines', lines);

app.use((req, res, next) => {
  throw new Error('Not found.');
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({ error: err.message });
});

module.exports = app;

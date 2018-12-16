const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');

const messages = require('./routes/messages');
const names = require('./routes/names');
const lines = require('./routes/lines');

const app = new Koa();

app.use(bodyParser());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
  }
});

const router = new Router();

router.use('/api/messages', messages.routes());
router.use('/api/names', names.routes());
router.use('/api/lines', lines.routes());

app.use(router.routes());

app.use(ctx => {
  ctx.throw(404, 'Not Found.');
});

module.exports = app;

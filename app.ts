import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as Router from 'koa-router';
import * as koaQs from 'koa-qs';

import { router as messages } from './routes/messages';
import { router as names } from './routes/names';
import { router as lines } from './routes/lines';

export const app = new Koa();

koaQs(app);

app.use(bodyParser());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);

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

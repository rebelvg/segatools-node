import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as Router from 'koa-router';
import * as koaQs from 'koa-qs';

import { readToken } from './middlewares/read-token';

import { router as messages } from './routes/messages';
import { router as names } from './routes/names';
import { router as lines } from './routes/lines';
import { router as users } from './routes/users';
import { router as stats } from './routes/stats';
import { router as admin } from './routes/admin';

export const app = new Koa();

koaQs(app);

app.use(bodyParser());
app.use(readToken);

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

router.use('/messages', messages.routes());
router.use('/names', names.routes());
router.use('/lines', lines.routes());
router.use('/users', users.routes());
router.use('/stats', stats.routes());
router.use('/admin', admin.routes());

app.use(router.routes());

app.use(ctx => {
  ctx.throw(404, 'Not Found.');
});

import * as Router from 'koa-router';
import * as passport from 'koa-passport';
import { Context } from 'koa';

import { isLoggedIn } from '../middlewares/is-logged-in';
import { CONFIG } from '../config';

export const router = new Router();

router.get('/', isLoggedIn, (ctx: Context, next) => {
  const { user } = ctx.state;

  ctx.body = { user };
});

router.get(
  '/auth/google',
  passport.authenticate('google', {
    session: false,
    scope: [
      'https://www.googleapis.com/auth/plus.login',
      'https://www.googleapis.com/auth/plus.me',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]
  })
);

router.get(
  '/auth/google/callback',
  async (ctx: Context, next) => {
    (ctx.request as any).koaCtx = ctx;

    await next();
  },
  passport.authenticate('google', { session: false }),
  (ctx: Context, next) => {
    const { user } = ctx.state;

    ctx.redirect(CONFIG.SERVER.googleRedirect + `/login/?token=${user.token}`);
  }
);

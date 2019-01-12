import * as Router from 'koa-router';
import * as passport from 'koa-passport';
import { Context } from 'koa';

export const router = new Router();

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

router.get('/auth/google/callback', passport.authenticate('google', { session: false }), (ctx: Context, next) => {
  const { user } = ctx.state;

  ctx.body = {
    token: user.token
  };
});

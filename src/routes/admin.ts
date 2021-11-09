import * as Router from 'koa-router';

import { isAdmin } from '../middlewares/is-admin';

import { router as users } from './admin/users';

export const router = new Router();

router.use(isAdmin);

router.use('/users', users.routes());

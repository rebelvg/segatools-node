import * as Router from 'koa-router';

import { get } from '../controllers/stats/get';

export const router = new Router();

router.get('/', get);

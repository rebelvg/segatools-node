import * as Router from 'koa-router';

import { show } from '../controllers/stats/show';

export const router = new Router();

router.get('/', show);

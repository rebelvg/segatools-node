import * as Router from 'koa-router';

import { find } from '../controllers/chapters/find';

export const router = new Router();

router.get('/', find);

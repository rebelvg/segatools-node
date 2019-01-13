import * as Router from 'koa-router';

import { find } from '../../controllers/admin/users/find';

export const router = new Router();

router.get('/', find);

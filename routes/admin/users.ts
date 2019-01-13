import * as Router from 'koa-router';

import { updateValidation } from '../../controllers/admin/users/validation/update';

import { find } from '../../controllers/admin/users/find';
import { update } from '../../controllers/admin/users/update';

export const router = new Router();

router.get('/', find);
router.post('/:id', updateValidation, update);

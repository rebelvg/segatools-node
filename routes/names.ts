import * as Router from 'koa-router';

import { findValidation } from '../controllers/names/validation/find';
import { updateValidation } from '../controllers/names/validation/update';

import { find } from '../controllers/names/find';
import { update } from '../controllers/names/update';

export const router = new Router();

router.get('/', findValidation, find);
router.post('/:id', updateValidation, update);

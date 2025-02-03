import * as Router from 'koa-router';

import { isEditor } from '../middlewares/is-editor';

import { findValidation } from '../controllers/names/validation/find';
import { updateValidation } from '../controllers/names/validation/update';

import { find } from '../controllers/names/find';
import { update } from '../controllers/names/update';

export const router = new Router();

router.use(isEditor);
router.get('/', findValidation, find);
router.post('/:id', isEditor, updateValidation, update);

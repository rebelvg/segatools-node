import * as Router from 'koa-router';

import { isEditor } from '../middlewares/is-editor';

import { findValidation } from '../controllers/messages/validation/find';
import { updateValidation } from '../controllers/messages/validation/update';

import { findById } from '../controllers/messages/findById';
import { find } from '../controllers/messages/find';
import { update } from '../controllers/messages/update';

export const router = new Router();

router.use(isEditor);
router.get('/:id', findById);
router.get('/', findValidation, find);
router.post('/:id', isEditor, updateValidation, update);

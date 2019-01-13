import * as Router from 'koa-router';

import { isEditor } from '../middlewares/is-editor';

import { findValidation } from '../controllers/lines/validation/unique';

import { replaceValidation } from '../controllers/lines/validation/replace';
import { updateValidation } from '../controllers/lines/validation/update';

import { unique } from '../controllers/lines/unique';
import { replace } from '../controllers/lines/replace';
import { update } from '../controllers/lines/update';

export const router = new Router();

router.get('/', findValidation, unique);
router.post('/replace', isEditor, replaceValidation, replace);
router.post('/update', isEditor, updateValidation, update);

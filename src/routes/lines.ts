import * as Router from 'koa-router';

import { isEditor } from '../middlewares/is-editor';

import { findValidation } from '../controllers/lines/validation/unique';
import { replaceValidation } from '../controllers/lines/validation/replace';
import { updateValidation } from '../controllers/lines/validation/update';

import { uniqueJapanese } from '../controllers/lines/unique-japanese';
import { uniqueEnglish } from '../controllers/lines/unique-english';
import { replace } from '../controllers/lines/replace';
import { update } from '../controllers/lines/update';

export const router = new Router();

router.use(isEditor);
router.get('/', findValidation, uniqueJapanese);
router.get('/english', findValidation, uniqueEnglish);
router.post('/replace', isEditor, replaceValidation, replace);
router.post('/update', isEditor, updateValidation, update);

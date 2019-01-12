import * as Router from 'koa-router';

import { isEditor } from '../middlewares/is-editor';

import { replaceValidation } from '../controllers/lines/validation/replace';

import { unique } from '../controllers/lines/unique';
import { replace } from '../controllers/lines/replace';

export const router = new Router();

router.get('/', unique);
router.post('/', isEditor, replaceValidation, replace);

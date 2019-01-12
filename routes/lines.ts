import * as Router from 'koa-router';

import { replaceValidation } from '../controllers/lines/validation/replace';

import { unique } from '../controllers/lines/unique';
import { replace } from '../controllers/lines/replace';

export const router = new Router();

router.get('/', unique);
router.post('/', replaceValidation, replace);

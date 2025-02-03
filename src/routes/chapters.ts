import * as Router from 'koa-router';

import { find } from '../controllers/chapters/find';
import { isEditor } from '../middlewares/is-editor';

export const router = new Router();

router.use(isEditor);
router.get('/', find);

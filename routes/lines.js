const Router = require('koa-router');

const router = new Router();

const unique = require('../controllers/lines/unique');
const replace = require('../controllers/lines/replace');

const replaceValidation = require('../controllers/lines/validation/replace');

router.get('/', unique);
router.post('/', replaceValidation, replace);

module.exports = router;

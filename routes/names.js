const Router = require('koa-router');

const router = new Router();

const find = require('../controllers/names/find');
const update = require('../controllers/names/update');

const findValidation = require('../controllers/names/validation/find');
const updateValidation = require('../controllers/names/validation/update');

router.get('/', findValidation, find);
router.post('/:id', updateValidation, update);

module.exports = router;

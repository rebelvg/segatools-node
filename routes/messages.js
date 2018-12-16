const Router = require('koa-router');

const router = new Router();

const find = require('../controllers/messages/find');
const findById = require('../controllers/messages/findById');
const update = require('../controllers/messages/update');

const findValidation = require('../controllers/messages/validation/find');
const updateValidation = require('../controllers/messages/validation/update');

router.get('/:id', findById);
router.get('/', findValidation, find);
router.post('/:id', updateValidation, update);

module.exports = router;

const express = require('express');

const asyncMiddleware = require('../helpers/async-middleware');

const find = require('../controllers/names/find');
const update = require('../controllers/names/update');

const findValidation = require('../controllers/names/validation/find');
const updateValidation = require('../controllers/names/validation/update');

const router = express.Router();

router.get('/', findValidation, asyncMiddleware(find));
router.post('/:id', updateValidation, asyncMiddleware(update));

module.exports = router;

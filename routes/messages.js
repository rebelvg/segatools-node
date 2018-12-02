const express = require('express');

const asyncMiddleware = require('../helpers/async-middleware');

const find = require('../controllers/messages/find');
const findById = require('../controllers/messages/findById');
const update = require('../controllers/messages/update');

const findValidation = require('../controllers/messages/validation/find');
const updateValidation = require('../controllers/messages/validation/update');

const router = express.Router();

router.get('/:id', asyncMiddleware(findById));
router.get('/', findValidation, asyncMiddleware(find));
router.post('/:id', updateValidation, asyncMiddleware(update));

module.exports = router;

const express = require('express');

const asyncMiddleware = require('../helpers/async-middleware');

const find = require('../controllers/messages/find');
const findById = require('../controllers/messages/findById');
const update = require('../controllers/messages/update');

const router = express.Router();

router.get('/:id', asyncMiddleware(findById));
router.get('/', asyncMiddleware(find));
router.post('/:id', asyncMiddleware(update));

module.exports = router;

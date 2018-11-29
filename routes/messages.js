const express = require('express');

const find = require('../controllers/messages/find');
const findById = require('../controllers/messages/findById');
const update = require('../controllers/messages/update');

const router = express.Router();

router.get('/:id', findById);
router.get('/', find);
router.post('/:id', update);

module.exports = router;

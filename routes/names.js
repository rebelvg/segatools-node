const express = require('express');

const asyncMiddleware = require('../helpers/async-middleware');

const find = require('../controllers/names/find');

const router = express.Router();

router.get('/', asyncMiddleware(find));

module.exports = router;

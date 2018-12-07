const express = require('express');

const asyncMiddleware = require('../helpers/async-middleware');

const replace = require('../controllers/lines/unique');

const router = express.Router();

router.get('/', asyncMiddleware(replace));

module.exports = router;

const express = require('express');

const asyncMiddleware = require('../helpers/async-middleware');

const unique = require('../controllers/lines/unique');
const replace = require('../controllers/lines/replace');

const replaceValidation = require('../controllers/lines/validation/replace');

const router = express.Router();

router.get('/', asyncMiddleware(unique));
router.post('/', replaceValidation, asyncMiddleware(replace));

module.exports = router;

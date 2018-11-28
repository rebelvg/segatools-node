const express = require('express');

const find = require('../controllers/names/find');

const router = express.Router();

router.get('/', find);

module.exports = router;

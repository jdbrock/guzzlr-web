var express = require('express');
var router = express.Router();

var beers = require('./beers.js');

router.get('/', function (req, res, next)
{
    res.send('oh hi');
});

router.get('/beers/all', beers.getAll);
router.get('/beers/today', beers.getToday);
router.get('/beer/:id', beers.findById);

module.exports = router;
var express = require('express');
var router = express.Router();

var mongo = require('mongodb');
var monk = require('monk');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// router.get('/helloworld', function(req, res) {
//   res.render('helloworld', { title: 'Hello, World!'})
// });

router.get('/products', function(req, res, next)
{
  var db = monk('mongodb://d3vuser:caltinea@ds047504.mongolab.com:47504/guzzlr');
  var collection = db.get('products');
  
  collection.find({}, function(e, docs)
  {
    res.render('productlist',
    {
      "productlist": docs
    });
  });
});

module.exports = router;

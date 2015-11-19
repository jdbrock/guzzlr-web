var express = require('express');
var router = express.Router();

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// router.get('/helloworld', function(req, res) {
//   res.render('helloworld', { title: 'Hello, World!'})
// });

router.get('/', function(req, res, next)
{
  var db = req.db;
  var collection = db.get('products');
  
  collection.find({}, {sort: {LastSeen: -1}}, function(e, docs)
  {
    res.render('products',
    {
      "products": docs
    });
  });
});

module.exports = router;

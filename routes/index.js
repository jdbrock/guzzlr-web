var express = require('express');
var moment = require('moment');
var _ = require('underscore');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// router.get('/helloworld', function(req, res) {
//   res.render('helloworld', { title: 'Hello, World!'})
// });

router.get('/everything', function(req, res, next)
{
  var db = req.db;
  var collection = db.get('products');
  
  collection.find({}, {sort: {LastSeen: -1}}, function(e, docs)
  {
    res.render('everything',
    {
      "products": docs
    });
  });
});

router.get('/notify', function(req, res, next)
{
  res.render('notify');
});

router.get('/today', function(req, res, next)
{
  var db = req.db;
  var collection = db.get('products-events');
  
  var now = moment().startOf('day');
  
  collection.find({}, {}, function(e, docs)
  {
    docs = _.filter(docs, function(value) {
      return moment(value.EventDate).startOf('day').isSame(now);
    });
    
    docs = _.map(docs, function(value) {
      return value.Product; 
    });
    
    docs = _.sortBy(docs, "LastSeen").reverse();
        
    res.render('today',
    {
      "products": docs
    });
  });
});

module.exports = router;

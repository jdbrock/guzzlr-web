var express = require('express');
var moment = require('moment');
var _ = require('underscore');
var router = express.Router();

var env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL
}

/* GET /everything */
router.get('/everything', function(req, res, next)
{
  var db = req.db;
  var collection = db.get('products');
  
  collection.find({}, {sort: {LastSeen: -1}}, function(e, docs)
  {
    docs = _.filter(docs, function(value) {
      return !value.OutOfStock;
    });
    
    res.render('everything', { "products": docs, "env": env, user: req.user });
  });
});

/* GET /notify */
router.get('/notify', function(req, res, next)
{
  res.render('notify', { env: env, user: req.user });
});

// GET /local
router.get('/local', function(req, res, next)
{
  res.render('local', { env: env, user: req.user });
});

router.post('/update-filters', function(req, res, next)
{
  
});

var today = function(req, res, next)
{
  var db = req.db;
  var collection = db.get('products-events');
  var now = moment().startOf('day');
  var date = now;
  var dateSpecified = !_.isEmpty(req.query.date);
  
  if (dateSpecified)
    date = moment(req.query.date).startOf('day');
  
  var past = !date.isSame(now);
  
  collection.find({}, {}, function(e, docs)
  {
    docs = _.filter(docs, function(value) {
      return moment(value.EventDate).startOf('day').isSame(date) && !value.FirstRun && !value.Product.OutOfStock;
    });
    
    docs = _.map(docs, function(value) {
      return value.Product; 
    });
    
    docs = _.sortBy(docs, "LastSeen").reverse();
        
    res.render('today', { "products": docs, "env": env, user: req.user, past: past, date: date });
  });
};

/* GET / */
router.get('/', today);
// router.get('/', function(req, res, next) {
//   res.render('index', { env: env, user: req.user });
// });

/* GET /today */
router.get('/today', today);

// /* GET /yesterday */
// router.get('/yesterday', function(req, res, next)
// {
//   var db = req.db;
//   var collection = db.get('products-events');
//   
//   var now = moment().startOf('day').subtract(1, 'days');
//   
//   collection.find({}, {}, function(e, docs)
//   {
//     docs = _.filter(docs, function(value) {
//       return moment(value.EventDate).startOf('day').isSame(now);
//     });
//     
//     docs = _.map(docs, function(value) {
//       return value.Product; 
//     });
//     
//     docs = _.sortBy(docs, "LastSeen").reverse();
//         
//     res.render('yesterday', { "products": docs, "env": env, user: req.user });
//   });
// });

router.get('/login',
  function(req, res){
    res.render('login', { env: env });
  });

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = router;

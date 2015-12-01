var express = require('express');
var moment = require('moment');
var _ = require('underscore');
var router = express.Router();

var env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL,
  TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET,
  TWITTER_ACCESS_TOKEN_KEY: process.env.TWITTER_ACCESS_TOKEN_KEY,
  TWITTER_ACCESS_TOKEN_SECRET: process.env.TWITTER_ACCESS_TOKEN_SECRET
}

var Twitter = require('twitter');
var twitterClient = new Twitter({
  consumer_key: env.TWITTER_CONSUMER_KEY,
  consumer_secret: env.TWITTER_CONSUMER_SECRET,
  access_token_key: env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: env.TWITTER_ACCESS_TOKEN_SECRET
});

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
    
    res.render('everything', { "products": docs, "env": env, user: req.user, guzzlrUser: req.guzzlrUser });
  });
});

// GET /local
router.get('/local', function(req, res, next)
{
  // var params = {screen_name: 'thebattaps'};
  // 
  // twitterClient.get('statuses/user_timeline', params, function(error, tweets, response){
  //   if (!error) {
  //   }
  // });
  // 
  res.render('local', { env: env, user: req.user, guzzlrUser: req.guzzlrUser });
});

router.post('/update-filters', function(req, res, next)
{
  // var guzzlrUser = req.guzzlrUser;
  // guzzlrUser.Filter = req.body
  
  var users = req.db.get('users');
  users.findAndModify(
  {
    "query": {"_id": req.guzzlrUser._id },
    "update": {"$set": {
      "filter": req.body.filter
    }}
  },
  function(err, doc) {
    if (err) throw err;
    console.log( doc );
  });
  
  
  // users.findOne({ _id: userIdHashed }, function(err, doc)
  // {
  //   req.guzzlrUser = doc;
  // });
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
        
    res.render('today', { "products": docs, "env": env, user: req.user, past: past, date: date, guzzlrUser: req.guzzlrUser });
  });
};

/* GET / */
router.get('/', today);
// router.get('/', function(req, res, next) {
//   res.render('index', { env: env, user: req.user });
// });

/* GET /today */
router.get('/today', today);

/* GET /notify */
router.get('/notify', function(req, res, next)
{
  var db = req.db;
  var test = req.guzzlrUser;
  res.render('notify', { env: env, user: req.user, guzzlrUser: req.guzzlrUser });
});

// router.get('/a', function(req, res, next)
// {
//   var db = req.db;
//   var collection = db.get('products-events');
//   var now = moment().startOf('day');
//   var date = now;
//   var dateSpecified = !_.isEmpty(req.query.date);
//   
//   res.render('test', { env: env, user: req.user, guzzlrUser: req.guzzlrUser });
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

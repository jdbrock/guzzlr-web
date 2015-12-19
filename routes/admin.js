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
router.get('/review-ratebeer-matches', function(req, res, next)
{
  var db = req.db;
  var collection = db.get('products');
  
  collection.find({}, {sort: {LastSeen: -1}}, function(e, docs)
  {
    docs = _.filter(docs, function(value) {
      return value.RateBeerInfo;
    });
    
    res.render('admin-review-ratebeer-matches', { "products": docs, "env": env, user: req.user, guzzlrUser: req.guzzlrUser });
  });
});

module.exports = router;

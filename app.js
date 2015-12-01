var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var pbkdf2 = require('pbkdf2-sha256');
var _ = require('underscore');
var myHash = require('./crypto.js');

require('dotenv').load();
// require('dotenv-safe').load();

//////////////// PASSPORT TEST

var passport = require('passport');

// This is the file we created in step 2.
// This will configure Passport to use Auth0
var strategy = require('./setup-passport');

// Session and cookies middlewares to keep user logged in
// var cookieParser = require('cookie-parser');
var session = require('express-session');

////////////////

var mongo = require('mongodb');
var monk = require('monk');
var underscore = require('underscore');
var db = monk('mongodb://d3vuser:caltinea@ds047504.mongolab.com:47504/guzzlr');

var routes = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');
var admin = require('./routes/admin');

var app = express();

// passport test
app.use(cookieParser());
app.use(session({
  secret: 'shhhhhhhhh',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Auth0 callback handler
app.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/login' }),
  function(req, res) {
    if (!req.user) {
      throw new Error('user null');
    }
    
    var userId = req.user.id;
    var userIdHashed = myHash(userId);
    var users = db.get('users');
    
    users.findOne({ _id: userIdHashed }, function(err, doc) {
      if (!doc)
      {
        var guzzlrUser = {
          _id: userIdHashed,
          authPlatform: req.user
        };

        users.insert(guzzlrUser);  
      }

      if (_.isEmpty(req.query.go))
        res.redirect("/");
      else
        res.redirect(req.query.go);
    });
  });
  

  
var requiresLogin = require('./requires-login');

// app.get('/user',
//   requiresLogin,
//   function (req, res) {
//     res.render('user', {
//       user: req.user
//     });
//   });

app.locals.moment = require('moment');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  req.db = db;
  next();
});

app.use(function(req, res, next) {
  
  var test = req.db;  
  
  if (req.user)
  {
    var userIdHashed = myHash(req.user.id);
    var users = req.db.get('users');
    
    users.findOne({ _id: userIdHashed }, function(err, doc)
    {
      req.guzzlrUser = doc;
      next();
    });
  }
  else
    next();
});

app.use('/', routes);
// app.use('/api', api);
app.use('/users', users);
app.use('/admin', admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

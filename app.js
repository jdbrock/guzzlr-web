var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('underscore');

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
    
    var users = db.get('users');
    users.insert(req.user);
    
    if (_.isEmpty(req.query.go))
      res.redirect("/");
    else
      res.redirect(req.query.go);
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

app.use('/', routes);
app.use('/users', users);

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

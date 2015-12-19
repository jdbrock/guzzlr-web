/*****************************************************************
 * IMPORTS
 ****************************************************************/

var moment = require('moment');
var _      = require('underscore');

/*****************************************************************
 * PUBLIC INTERFACE
 ****************************************************************/

/* 
   Method: getAll()
   Params: page_size, last_name
*/
exports.getAll = function(req, res) {
    
    // Get collection.
    var db  = req.db;
    var col = db.get('products');
    
    // Calculate limits.
    var lastSeenLimit = moment().subtract(2, 'days').toDate();
    
    // Build filter.
    var filter = { };
    
    if (req.query.last_name)
        filter = { LastSeen: { $gt: lastSeenLimit }, OutOfStock: false, Name: { $gt: req.query.last_name } };
    else
        filter = { LastSeen: { $gt: lastSeenLimit }, OutOfStock: false };
        
    // Build query options.
    var options = { };
    
    if (req.query.page_size)
        options = { sort: { Name: 1 }, limit: req.query.page_size };
    else
        options = { sort: { Name: 1 }, limit: 100 };
    
    // Query and return results.
    col.find(filter, options, function(e, docs) {
        res.send(docs);
    });
    
};

/* 
   Method: getToday()
   Params: date
*/
exports.getToday = function(req, res) {
    
    // Get collection.
    var db  = req.db;
    var col = db.get('products-events');

    // Calculate limits.
    var today   = moment().startOf('day');
    var minDate = moment(today);

    if (!_.isEmpty(req.query.date))
        minDate = moment(req.query.date).startOf('day');

    var maxDate = moment(minDate).add(1, 'days');

    // Build filter.
    var filter = { EventDate: { $gte: minDate.toDate(), $lt: maxDate.toDate() }, 'Product.OutOfStock': false, FirstRun: false };
    
    // Build query options.
    var options = { sort: { EventDate: -1 } };
  
    // Query and return results.
    col.find(filter, options, function(e, docs)
    {
        res.send(docs);
    });
};

/* Method: findById() */
exports.findById = function(req, res) {
    
};
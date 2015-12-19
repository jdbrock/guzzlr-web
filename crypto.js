var pbkdf2 = require('pbkdf2-sha256');

var myHash = function(message) {
  var salt = 'mysaltbringsalltheboystotheyard1111222424244';
  var res = pbkdf2(message, salt, 1, 12);
  var asString = res.toString();
  
  return asString;
};

module.exports = myHash;
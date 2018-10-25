var jwt = require('jsonwebtoken');
var config = require('../protected-config');
var ValidateToken = require('./ValidateToken');


function verifyAdminToken (req, res, next) {
  ValidateToken(req, res, next, 'admin');
}


module.exports = verifyAdminToken;

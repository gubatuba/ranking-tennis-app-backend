var jwt = require('jsonwebtoken');
var config = require('../protected-config');
var ValidateToken = require('./ValidateToken');

function verifyToken (req, res, next) {

  ValidateToken(req, res, next, 'user');

}


module.exports = verifyToken;
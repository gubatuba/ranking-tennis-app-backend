var jwt = require('jsonwebtoken');
var config = require('../protected-config');
function verifyToken(req, res, next) {
  // var token = req.headers['x-access-token'];
  if (!req.headers['authorization']) {
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  }
  var token = req.headers['authorization'].replace('Bearer ', '').replace('bearer ', '');
  if (!token)
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  jwt.verify(token, config.secret, function(err, decoded) {
    if (err)
    return res.status(401).send({ auth: false, message: 'Failed to authenticate token.' });
    // if everything good, save to request for use in other routes
    req.userId = decoded.id;
    req.decodedEmail = decoded.email;
    req.role = decoded.role;
    /* if (req.method == "GET") {
      if (req.params.email == decoded.email) {
        req.userId = decoded.id;
      }
      else {
        return res.status(401).send({ auth: false, message: 'Failed to authenticate token.' });
      }
    }
    else {
      if (req.body.email == decoded.email) {
        req.userId = decoded.id;
      }
      else {
        return res.status(401).send({ auth: false, message: 'Failed to authenticate token.' });
      }
    }
     */  
    next();
  });
}
module.exports = verifyToken;
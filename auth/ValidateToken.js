var jwt = require('jsonwebtoken');
var config = require('../protected-config');

function validateToken(req, res, next, role) {
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

    if (decoded.role===role || decoded.role==='admin') {
      req.userId = decoded.id;
      req.decodedEmail = decoded.email;
      req.role = decoded.role;
  
      next();
    } else {
      return res.status(401).send({ auth: false, message: 'Failed to authenticate token. (token)' });

    }


    

    // if everything good, save to request for use in other routes
  });
}

module.exports = validateToken;

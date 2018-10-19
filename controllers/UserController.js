var DbRepo = require('../app-db');
var express = require('express');
var router = express.Router();
var VerifyToken = require('../auth/VerifyToken');
var SendEmail = require('../app-email');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var config = require('../protected-config');
var bodyParser = require('body-parser')
router.use( bodyParser.json() );       // to support JSON-encoded bodies
router.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
})); 

// register 
router.post('/register', function (req, res) {
	var dbrepo = new DbRepo();
	var hashedPassword = bcrypt.hashSync(req.body.password, 8);
	
	dbrepo.insertUser({ email: req.body.email, password: hashedPassword }, function(err, result){
		if (err) return res.status(500).send("There was a problem registering the user.")

		// create a token
		var token = jwt.sign({ id: result.rows[0].id, email: req.body.email, role: result.rows[0].role }, config.secret, {
			expiresIn: 86400 // expires in 24 hours
		}); 
		//SendEmail(req.body);
		res.status(200).send({ auth: true, token: token, id: result.rows[0].id });
 	}); 
});

// update user password
router.post('/', VerifyToken, function (req, res) {
	var dbrepo = new DbRepo();
	var hashedPassword = bcrypt.hashSync(req.body.password, 8);
	
	var findkey = { id : req.userId };
	if (req.decodedEmail != req.body.email) return res.status(500).send({ auth: false, message: 'Failed to authenticate token. (email)' });
	dbrepo.updateUser(findkey, { password: hashedPassword }, function(err, result){
		if (err) {
			res.status(500).send({ message: err.message });
			return;
		}
		if (result.rowCount === 1) {
			console.log(result);
			console.log({ message: 'Update ok', email: req.body.email });
			res.send({ message: 'Update ok', email: req.body.email });	
			return;
		}
		else {
			console.log(result);
			console.log({ message: 'NoAction ok', email: req.body.email });
			res.send({ message: 'NoAction ok', email: req.body.email });	
			return;
		}
	});
});

// RETURNS ALL THE USERS IN THE DATABASE
router.get('/', VerifyToken, function (req, res) {
	var dbrepo = new DbRepo();
	if (req.role != config.adminRole) return res.status(500).send({ auth: false, message: 'Failed to authenticate token. (role)' });
	dbrepo.findUser(function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (result) {
			console.log(result.rows);
			res.send(result.rows);
		} else {
			console.log("nenhum usuario encontrado");
			res.status(404).send(err);
		};
	});
});

// GETS A SINGLE USER FROM THE DATABASE
router.get('/:email', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
	var findkey = { email : req.params.email };
	if (req.role != config.adminRole) return res.status(500).send({ auth: false, message: 'Failed to authenticate token. (role)' });
	dbrepo.findOneUser(findkey, function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (result) {
			console.log(result.rows);
			res.send(result.rows);
			//res.end();
		} else {
			console.log("Usuário não encontrado");
			res.status(404).send(err);
		};
	});
});

// GETS A SINGLE USER FROM THE DATABASE
router.post('/login', function(req, res) {
	var dbrepo = new DbRepo();
	var findkey = { email : req.body.email };
	dbrepo.loginUser(findkey, function(err, result) {
		if (err) return res.status(500).send('Error on the server.');
		if (result.rowCount===0) return res.status(404).send('No user found.');
		var passwordIsValid = bcrypt.compareSync(req.body.password, result.rows[0].password);
		if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
		var token = jwt.sign({ id: result.rows[0].id, email: result.rows[0].email, role: result.rows[0].role }, config.secret, {
			expiresIn: 86400 // expires in 24 hours
		});
		res.status(200).send({ auth: true, token: token, id: result.rows[0].id });
	});
});


// DELETES A USER FROM THE DATABASE
router.delete('/:id', VerifyToken, function (req, res) {
    var dbrepo = new DbRepo();
	var findkey = { id : req.params.id };
	if (req.role != config.adminRole) return res.status(500).send({ auth: false, message: 'Failed to authenticate token. (role)' });
	dbrepo.deleteUser(findkey, function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (result.rowCount === 1) {
			console.log(result);
			res.send("User [" + req.params.id + "] was deleted.");
			//res.end();
		} else {
			console.log("User not found");
			res.status(404).send(err);
        };
    });
}); 

module.exports = router;
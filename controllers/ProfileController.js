var DbRepo = require('../app-db');
var express = require('express');
var router = express.Router();
var VerifyToken = require('../auth/VerifyToken');
var bodyParser = require('body-parser')
var config = require('../protected-config');
router.use( bodyParser.json() );       // to support JSON-encoded bodies
router.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
})); 

router.get('/:email', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
	var findkey = { id : req.userId };
	if (req.decodedEmail != req.params.email) return res.status(401).send({ auth: false, message: 'Failed to authenticate token. (email)' });
	dbrepo.findOneProfile(findkey, function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (result) {
			console.log(result.rows);
			res.send(result.rows);
			//res.end();
		} else {
			console.log("Perfil não encontrado");
			res.status(404).send(err);
		};
	});
});

router.get('/', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
	if (req.role != config.adminRole) return res.status(500).send({ auth: false, message: 'Failed to authenticate token. (role)' });
	dbrepo.findProfile(function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (result) {
			console.log(result.rows);
			res.send(result.rows);
		} else {
			console.log("nenhum perfil encontrado");
			res.status(404).send(err);
		};
	});
});


router.post('/', VerifyToken, function (req, res, next) {
	var dbrepo = new DbRepo();
	var findkey = { id : req.userId };
	if (req.decodedEmail != req.body.email) return res.status(401).send({ auth: false, message: 'Failed to authenticate token. (email)' });
	dbrepo.upsertProfile(findkey, req.body, function(err, result){
		if (err) {
			res.status(500).send({ message: err.message });
			return;
		}
		
		if (result.rowCount === 1 && result.command === "UPDATE") {
			console.log(result);
			console.log({ message: 'Update ok', email: req.body.email });
			res.send({ message: 'Update ok', email: req.body.email });	
			return;
		} else if (result.rowCount === 1 && result.command === "INSERT") {
			console.log(result);
			console.log({ message: 'Insert ok', email: req.body.email });
			res.send({ message: 'Insert ok', email: req.body.email });	
			return;
		}
	});
});

module.exports = router;
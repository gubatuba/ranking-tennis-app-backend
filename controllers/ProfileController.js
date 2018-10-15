var DbRepo = require('../app-db');
var express = require('express');
var router = express.Router();
var VerifyToken = require('../auth/VerifyToken');
var bodyParser = require('body-parser')
router.use( bodyParser.json() );       // to support JSON-encoded bodies
router.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
})); 

router.get('/:email', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
	var findkey = { email : req.params.email };
	if (req.decodedEmail != req.params.email) return res.status(401).send({ auth: false, message: 'Failed to authenticate token. (email)' });
	dbrepo.findOne('profiles', findkey, function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		
		if (result) {
			console.log(result);
			res.send(result);
			//res.end();
		} else {
			console.log("não encontrado");
			res.status(404).send(err);
		};
	});
});

router.get('/', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
	dbrepo.find('profiles', function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (result) {
			console.log(result);
			res.send(result);
			//res.end();
		} else {
			console.log("não encontrado");
			res.status(404).send(err);
		};
	});
});


router.post('/', VerifyToken, function (req, res, next) {
	var dbrepo = new DbRepo();
	var findkey = { email : req.body.email };
	if (req.decodedEmail != req.body.email) return res.status(401).send({ auth: false, message: 'Failed to authenticate token. (email)' });
	dbrepo.upsert('profiles', findkey, req.body, function(err, result){
		if (err) {
			res.status(500).send({ message: err.message });
			return;
		}
		
		if (result.modifiedCount === 1) {
			console.log(result);
			console.log({ message: 'Update ok', email: req.body.email });
			res.send({ message: 'Update ok', email: req.body.email });	
			return;
		}
		if (result.modifiedCount === 0 && result.matchedCount === 1) {
			console.log(result);
			console.log({ message: 'NoAction ok', email: req.body.email });
			res.send({ message: 'NoAction ok', email: req.body.email });	
			return;
		}
		console.log(result);
		console.log({ message: 'Insert ok', email: req.body.email });
		res.send({ message: 'Insert ok', email: req.body.email });
	});
});

module.exports = router;
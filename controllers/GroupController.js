var DbRepo = require('../app-db');
var express = require('express');
var router = express.Router();
var VerifyToken = require('../auth/VerifyToken');
var bodyParser = require('body-parser')
router.use( bodyParser.json() );       // to support JSON-encoded bodies
router.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
})); 

router.get('/:groupName', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
	var findkey = { groupName : req.params.groupName };
	dbrepo.findOne('groups', findkey, function(err, result) {
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
	var findkey = { groupName : req.body.groupName };
	if (req.decodedEmail != req.body.admins[0].email) return res.status(401).send({ auth: false, message: 'Failed to authenticate token. (email)' });
	dbrepo.upsert('groups', findkey, req.body, function(err, result){
		if (err) {
			res.status(500).send({ message: err.message });
			return;
		}
		if (result.modifiedCount === 1) {
			console.log(result);
			console.log({ message: 'Update ok', groupName: req.body.groupName });
			res.send({ message: 'Update ok', groupName: req.body.groupName });	
			return;
		}
		if (result.modifiedCount === 0 && result.matchedCount === 1) {
			console.log(result);
			console.log({ message: 'NoAction ok', groupName: req.body.groupName });
			res.send({ message: 'NoAction ok', groupName: req.body.groupName });	
			return;
		}
		console.log(result);
		console.log({ message: 'Insert ok', groupName: req.body.groupName });
		res.send({ message: 'Insert ok', groupName: req.body.groupName });
	});
});

module.exports = router;
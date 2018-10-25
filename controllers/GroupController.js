var DbRepo = require('../app-db');
var express = require('express');
var router = express.Router();
var VerifyToken = require('../auth/VerifyToken');
var bodyParser = require('body-parser');
var config = require('../protected-config');

router.use( bodyParser.json() );       // to support JSON-encoded bodies
router.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
})); 

router.put('/:id/users/', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
	if (req.userId != req.params.userId) return res.status(500).send({ auth: false, message: 'Failed to authenticate token. (id)' });
	
	var entity = { groupId : req.params.id, userId: req.userId };
	dbrepo.insertUserGroup(entity, function(err, result) {
		if(err) {
			res.status(500).send(err);
			return;
		}
		if (result) {
			console.log({ message: 'Usuario inserido no grupo com sucesso', id : req.params.id, userId: req.userId });
			res.send({ message: 'Usuario inserido no grupo com sucesso', id : req.params.id, userId: req.userId });
			//res.end();
		} else {
			console.log("Problema ao inserir o usuario no grupo");
			res.status(500).send("Problema ao inserir o usuario no grupo");
		};
	})
});

router.post('/:id/users/', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
	var findkey = { id : req.params.id, userId: req.userId };
	dbrepo.findOneGroupUser(findkey, function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (result.rowCount === 1 && result.rows[0].flag_admin) {
			dbrepo.updateGroupUser(findkey, req.body, function(err, result) {
				if (err) {
					res.status(500).send(err);
					return;
				}
				if (result) {
					console.log({ message: 'lista de usuarios atualizada com sucesso', qtdItens: result.rowCount, id: req.params.id });
					res.send({ message: 'lista de usuarios atualizada com sucesso', qtdItens: result.rowCount, id: req.params.id });
					//res.end();
				} else {
					console.log("Grupo não encontrado");
					res.status(404).send(err);
				};
			});
		} else {
			console.log({ message: 'Usuario não é admin do grupo' });
			res.send({ message: 'Usuario não é admin do grupo' });	
			return;	
		}
	});	
});

router.get('/:id/users/', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
	var findkey = { id : req.params.id, userId: req.userId };
	dbrepo.findOneGroupUser(findkey, function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (result.rowCount === 1 && result.rows[0].approved) {
			dbrepo.findGroupUser(findkey, function(err, result) {
				if (err) {
					res.status(500).send(err);
					return;
				}
				if (result) {
					console.log(result.rows);
					res.send(result.rows);
					//res.end();
				} else {
					console.log("Grupo não encontrado");
					res.status(404).send(err);
				};
			});
		} else {
			console.log({ message: 'Usuario não participa do grupo' });
			res.send({ message: 'Usuario não participa do grupo' });	
			return;	
		}
	});	
});


router.get('/:id', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
	var findkey = { id : req.params.id };
	dbrepo.findOneGroup(findkey, function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (result) {
			console.log(result.rows);
			res.send(result.rows);
			//res.end();
		} else {
			console.log("Grupo não encontrado");
			res.status(404).send(err);
		};
	});
});

router.get('/find/:name', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
	var findkey = { name : req.params.name };
	dbrepo.findGroupByName(findkey, function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (result) {
			console.log(result.rows);
			res.send(result.rows);
			//res.end();
		} else {
			console.log("Grupo não encontrado");
			res.status(404).send(err);
		};
	});
});

router.get('/', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
	if (req.role != config.adminRole) return res.status(500).send({ auth: false, message: 'Failed to authenticate token. (role)' });
	dbrepo.findGroup(function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (result) {
			console.log(result.rows);
			res.send(result.rows);
			//res.end();
		} else {
			console.log("nenhum grupo encontrado");
			res.status(404).send(err);
		};
	});
});

router.put('/', VerifyToken, function (req, res, next) {
	var dbrepo = new DbRepo();
	var findkey = { id : req.userId };
	dbrepo.insertGroup(findkey, req.body, function(err, result){
		if (err) {
			console.log(err);
			res.status(500).send({ message: err.message });
			return;
		}
		if (result.rowCount === 1) {
			console.log(result);
			console.log({ message: 'Insert ok', id: result.rows[0].id });
			var inserData = { groupId : result.rows[0].id, userId : req.userId };
			dbrepo.insertAdmin(findkey, inserData, function(err, result){
				if (err) {
					console.log(err);
					res.status(500).send({ message: err.message });
					return;
				}
				console.log(result);
				console.log({ message: 'Insert Admin ok' });
				res.send({ message: 'Insert ok', id: inserData.groupId, nome: req.body.nome });	
				return;	
			});
		}
	});
});

module.exports = router;
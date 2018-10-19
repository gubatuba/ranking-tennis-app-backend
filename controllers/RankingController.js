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

router.get('/:id', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
	var findkey = { id : req.params.id, userId: req.userId };
	dbrepo.findOneGroupUser(findkey, function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (result.rowCount === 1) {
			dbrepo.findOneRanking(findkey, function(err, result) {
				if (err) {
					res.status(500).send(err);
					return;
				}
				if (result) {
					console.log(result.rows);
					res.send(result.rows);
					//res.end();
				} else {
					console.log("Ranking não encontrado");
					res.status(404).send(err);
				};
			});
		} else {
			console.log({ message: 'Usuario não faz parte do grupo' });
			res.send({ message: 'Usuario não faz partedo grupo' });	
			return;	
		}
	});	
});

router.put('/challenge/:id/:challengedId', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
	var findkey = { id : req.params.id, userId: req.userId, challengedId: req.params.challengedId };
	dbrepo.findOneGroupChallenge(findkey, function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (result.rowCount === 2) {
            dbrepo.findOneOpenChallenge(findkey, function(err, result){
                if (err) {
					res.status(500).send(err);
					return;
                }
                if (result.rowCount === 0) {
                    dbrepo.insertChallenge(findkey, function(err, result) {
                        if (err) {
                            res.status(500).send(err);
                            return;
                        }
                        if (result) {
                            console.log({ message: 'Insert Desafio ok', id: result.rows[0].id });
                            res.send({ message: 'Insert Desafio ok', id: result.rows[0].id });
                            //res.end();
                        } else {
                            console.log("Problema ao cadastrar desafio");
                            res.status(404).send(err);
                        };
                    });
                } else {
                    console.log({ message: 'Desafio aberto entre o desafiante e desafiado' });
			        res.send({ message: 'Desafio aberto entre o desafiante e desafiado' });
                }
            });
			
		} else {
			console.log({ message: 'Desafiante ou desafiado não fazem parte do grupo' });
			res.send({ message: 'Desafiante ou desafiado não fazem parte do grupo' });	
			return;	
		}
	});	
});

router.post('/challenge/:id/accept', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
	var findkey = { id : req.params.id, userId: req.userId };
	dbrepo.findOneChallengeById(findkey, function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (result.rowCount === 1 && result.rows[0].challenged_id === req.userId && result.rows[0].status === 'C') {
			dbrepo.updateChallenge(findkey, { status: 'A' }, function(err, result) {
				if (err) {
					res.status(500).send(err);
					return;
				}
				if (result) {
					console.log({ message: 'Update Desafio ok - Aceito' });
					res.send({ message: 'Update Desafio ok - Aceito' });
					//res.end();
				} else {
					console.log("Problema ao atualizar desafio");
					res.status(404).send(err);
				};
			});
		} else {
			console.log({ message: 'Desafio pendente de aceite não encontrado ou usuário não é o desafiante' });
			res.send({ message: 'Desafio pendente de aceite não encontrado ou usuário não é o desafiante' });	
			return;	
		}
	});	
});

router.post('/challenge/:id/close', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
    var findkey = { id : req.params.id, userId: req.userId };
    if (!req.body.length) {
        console.log("Resultados não enviados");
        res.status(404).send("Resultados não enviados");
        return;
    }
	dbrepo.findOneChallengeById(findkey, function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (result.rowCount === 1 && result.rows[0].status === 'A' && (result.rows[0].challenger_id === req.userId || result.rows[0].challenged_id === req.userId)) {
			dbrepo.updateChallenge(findkey, { status: 'F' }, function(err, result) {
				if (err) {
					res.status(500).send(err);
					return;
				}
				if (result) {
					console.log({ message: 'Update Desafio ok - Finalizado' });
					dbrepo.insertResult(findkey, req.body, function(err, result) {
                        if (err) {
                            res.status(500).send(err);
                            return;
                        }
                        if (result) {
                            console.log("Resultados cadastrados ok");
                            res.send({ message: 'Update Desafio ok - Finalizado' });
                        } else {
                            console.log("Problema ao cadastrar resultados do desafio");
					        res.status(404).send(err);        
                        }

                    });
				} else {
					console.log("Problema ao atualizar desafio");
					res.status(404).send(err);
				};
			});
		} else {
			console.log({ message: 'Desafio não encontrado' });
			res.send({ message: 'Desafio não encontrado' });	
			return;	
		}
	});	
});


module.exports = router;
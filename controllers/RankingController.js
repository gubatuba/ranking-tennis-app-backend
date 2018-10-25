var DbRepo = require('../app-db');
var express = require('express');
var router = express.Router();
var VerifyToken = require('../auth/VerifyToken');
var async = require("async");
var bodyParser = require('body-parser');

router.use( bodyParser.json() );       // to support JSON-encoded bodies
router.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
})); 

router.get('/:id/pyramid/', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
	var findkey = { id : req.params.id, userId: req.userId };
	dbrepo.findOneGroup(findkey, function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (result.rowCount === 1 && result.rows[0].tag == 'pyramid') {
			dbrepo.findOneRanking(findkey, function(err, result) {
				if (err) {
					res.status(500).send(err);
					return;
				}

				var piramid = {};
				var totalUsers = 0;
				var i;
				for (i=0; totalUsers<result.rows.length; i++) {
					var linha = {};
					var j = 0;
					while(j<i+1 && totalUsers<result.rows.length)
					{
						linha[j+1] = result.rows[totalUsers];
						totalUsers++;
						j++;
					}
					piramid[i+1] = linha;
					//printf ("\n");
				}
				res.send(piramid);
						
			});

		} else {
			res.status(404).send( { message: "Ranking não econtrado ou não é do tipo piramide" } );
		}
	});
});

router.get('/:id/atp/', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
	var findkey = { id : req.params.id, userId: req.userId };
	dbrepo.findOneGroup(findkey, function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (result.rowCount === 1 && result.rows[0].tag == 'atp') {
			dbrepo.findOneRanking(findkey, function(err, result) {
				if (err) {
					res.status(500).send(err);
					return;
				}
				res.send(result.rows);
						
			});

		} else {
			res.status(404).send( { message: "Ranking não econtrado ou não é do tipo atp" } );
		}
	});
});

router.get('/:id/points/', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
	var findkey = { id : req.params.id, userId: req.userId };
	dbrepo.findOneGroup(findkey, function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (result.rowCount === 1 && result.rows[0].tag == 'points') {
			dbrepo.findOneRanking(findkey, function(err, result) {
				if (err) {
					res.status(500).send(err);
					return;
				}
				res.send(result.rows);
						
			});

		} else {
			res.status(404).send( { message: "Ranking não econtrado ou não é do tipo pontos corridos" } );
		}
	});
});

router.get('/:id/draw/', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
	var findkey = { id : req.params.id, userId: req.userId };
	dbrepo.findOneGroup(findkey, function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (result.rowCount === 1 && result.rows[0].tag == 'draw') {
			dbrepo.findOneRanking(findkey, function(err, result) {
				if (err) {
					res.status(500).send(err);
					return;
				}
				res.send(result.rows);
						
			});

		} else {
			res.status(404).send( { message: "Ranking não econtrado ou não é do tipo chave" } );
		}
	});
});

router.post('/:id/draw/', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
	var findkey = { id : req.params.id, userId: req.userId };
	dbrepo.findOneGroup(findkey, function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (result.rowCount === 1 && result.rows[0].tag == 'draw') {
			dbrepo.findGroupApprovedUser(findkey, function(err, result) {
				if (err) {
					res.status(500).send(err);
					return;
				}
				
				var remaingUsers = result.rows;
				dbrepo.deleteDrawChallenge(findkey, function(err, result) {
					if (err) {
						res.status(500).send(err);
						return;
					}
					console.log("Desafios removidos com sucesso");
					//remaingUsers = [{user_id: 1},{user_id: 2},{user_id: 3},{user_id: 4},{user_id: 5},{user_id: 6},{user_id: 7},{user_id: 8},{user_id: 9},{user_id: 10},{user_id: 11},{user_id: 12},{user_id: 13} ];
					var i = 0;
					var gameId = 1;
					var treeSize = 1;
					//if (remaingUsers.length>=2 && remaingUsers.length<4) treeSize = 2;
					if (remaingUsers.length>=4 && remaingUsers.length<8) treeSize = 2;
					if (remaingUsers.length>=8 && remaingUsers.length<16) treeSize = 4;
					if (remaingUsers.length>=16 && remaingUsers.length<32) treeSize = 8;
					if (remaingUsers.length>=32 && remaingUsers.length<64) treeSize = 16;
					if (remaingUsers.length>=64 && remaingUsers.length<128) treeSize = 32;
					if (remaingUsers.length>=128 && remaingUsers.length<256) treeSize = 64;
					var challenges = [];
					while(i<treeSize) {

						var index = Math.floor(Math.random() * remaingUsers.length);
						var challenger = remaingUsers[index];
						remaingUsers.splice(index, 1);
						index = Math.floor(Math.random() * remaingUsers.length);
						var challenged = remaingUsers[index];
						remaingUsers.splice(index, 1);
	
						var challenge = { id: findkey.id, userId: challenger.user_id, challengedId: challenged.user_id, tag: 'draw', round: 1, game: gameId };
						challenges[i] = challenge;
						i++;
						gameId++;
					}
					// BYE
					gameId = 1;
					while(remaingUsers.length>0) {
						if (remaingUsers.length>treeSize)  {
							var index = Math.floor(Math.random() * remaingUsers.length);
							var challenger = remaingUsers[index];
							remaingUsers.splice(index, 1);
							index = Math.floor(Math.random() * remaingUsers.length);
							var challenged = remaingUsers[index];
							remaingUsers.splice(index, 1);
		
							var challenge = { id: findkey.id, userId: challenger.user_id, challengedId: challenged.user_id, tag: 'draw', round: 2, game: gameId };
							challenges[i] = challenge;
						}
						else {
							var index = Math.floor(Math.random() * remaingUsers.length);
							var challenger = remaingUsers[index];
							remaingUsers.splice(index, 1);
							var challenge = { id: findkey.id, userId: challenger.user_id, challengedId: challenger.user_id, tag: 'draw', round: 2, game: gameId };
							challenges[i] = challenge;
						}
						i++;
						gameId++;
					}


					async.each(challenges,dbrepo.insertChallenge,function(err) {
						// Release the client to the pg module
						if (err) {
							res.status(500).send(err);
							console.log(err);
							return;
						}
						console.log("Desafio cadastrao com sucesso");
						res.send({message: "chave sorteada com sucesso", allChallenges: challenges});
					});
				});	
			});

		} else {
			res.status(404).send( { message: "Ranking não econtrado ou não é do tipo chave" } );
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
			dbrepo.updateChallengeStatus(findkey, { status: 'A' }, function(err, result) {
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

router.post('/challenge/:id/revoke', VerifyToken, function(req, res) {
	var dbrepo = new DbRepo();
	var findkey = { id : req.params.id, userId: req.userId };
	dbrepo.findOneChallengeById(findkey, function(err, result) {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (result.rowCount === 1 && result.rows[0].challenged_id === req.userId && result.rows[0].status === 'C') {
			dbrepo.updateChallengeStatus(findkey, { status: 'R' }, function(err, result) {
				if (err) {
					res.status(500).send(err);
					return;
				}
				if (result) {
					console.log({ message: 'Update Desafio ok - Recusado' });
					res.send({ message: 'Update Desafio ok - Recusado' });
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
		var challengeType = result.rows[0].tag;
		var nextRound = result.rows[0].round + 1;
		var nextGame = result.rows[0].game % 2;
		var groupId = result.rows[0].group_id;
		var challengerId = result.rows[0].challenger_id;
		var challengedId = result.rows[0].challenged_id;
		if (result.rowCount === 1 && result.rows[0].status === 'A' && (result.rows[0].challenger_id === req.userId || result.rows[0].challenged_id === req.userId)) {
			dbrepo.updateChallengeStatus(findkey, { status: 'F' }, function(err, result) {
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
							if (challengeType === 'draw') {
								// find next challenge
								findkey = { id: groupId, round: nextRound, game: nextGame };
								dbrepo.findOneChallengeByRoundAndGame(findkey, function(err, result) {
									if (err) {
										res.status(500).send(err);
										return;
									}
									var winner;
									var challengerPoints = 0;
									var challengedPoints = 0;
									for (i = 0; i < req.body.length; i++) {
										if (req.body[i].challenger > req.body[i].challenged) {
											challengerPoints+=1;
										} else {
											challengedPoints+=1;
										}
									}
									if (challengerPoints > challengedPoints) {
										winner = challengerId;
									}
									else {
										winner = challengedId;
									}

									if (result.rowCount === 1) {
										// found --> update challengerId
										findkey = { id : result.rows[0].id };
										entity = { challenger: winner};
										dbrepo.updateChallengeChallenger(findkey, entity, function(err, result) {
											if (err) {
												res.status(500).send(err);
												return;
											}
											console.log({ message: 'Desafio seguinte atualizdo com sucesso' });
											res.send({ message: 'Update Desafio ok - Finalizado com atualizacao do jogo seguinte' });
										});

									} else {
										findkey = { id: groupId, userId: winner, challengedId: winner, tag: 'draw', round: nextRound, game: nextGame }
										dbrepo.insertChallenge(findkey, function(err, result) {
											if (err) {
												res.status(500).send(err);
												return;
											}
											console.log({ message: 'Desafio seguinte criado com sucesso' });
											res.send({ message: 'Update Desafio ok - Finalizado com criação do jogo seguinte' });
										});
										// not found --> create with challenger and challenged with the same id
										//entity.id, entity.userId, entity.challengedId, challengeStatus, round, game
									}

									
									
								});
									
							} else {
								res.send({ message: 'Update Desafio ok - Finalizado' });
							}                            
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
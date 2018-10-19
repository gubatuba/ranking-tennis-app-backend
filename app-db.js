'use strict'

var config = require("./protected-config");


const pg = require('pg');
const pool = new pg.Pool({
	user: config.user,
	host: config.host,
	database: config.database,
	password: config.password,
	port: config.port
});

class DbRepo {

	insertUser(entity, callback) {
		pool.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id",
		[entity.email, entity.password], function(err, result) {
			callback(err, result);
			pool.end;
		});
	}

	loginUser(entity, callback) {
		pool.query("SELECT * FROM users WHERE email = $1",
		[entity.email], function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

/* 	insertOne(entity, callback) {
		MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
			var db = client.db('ranking-tennis-app-backend-db');      
			db.collection(collection).insertOne(entity, function(err, result) {
				callback(err, result);
			});
			client.close();	
		});
	}
 */
	findOneUser(findkey, callback) {
		pool.query("SELECT * FROM users WHERE email = $1",
		[findkey.email], function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

	findOneProfile(findkey, callback) {
		pool.query("SELECT * FROM profiles WHERE user_id = $1",
		[findkey.id], function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}


	findOneGroup(findkey, callback) {
		pool.query("SELECT g.id, g.name, g.group_type, gt.name as group_type_name, gt.tag FROM groups g, group_types gt WHERE g.group_type = gt.id AND g.id = $1",
		[findkey.id], function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}


/* 	findOne(findkey, callback) {
		MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
			var db = client.db('ranking-tennis-app-backend-db');      
			db.collection(collection).findOne(findkey, function(err, result) {
				callback(err, result);
			});
			client.close();	
		});
	} */


	findUser(callback) {
		pool.query("SELECT * from users",
		function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

	findProfile(callback) {
		pool.query("SELECT * from profiles",
		function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

	findGroup(callback) {
		pool.query("SELECT g.id, g.name, g.group_type, gt.name as group_type_name, gt.tag FROM groups g, group_types gt WHERE g.group_type = gt.id;",
		function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

	findGroupByName(findkey, callback) {
		var query = "SELECT * FROM groups WHERE lower(name) like lower(\'%"+ findkey.name + "%\')";
		pool.query(query ,
		function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

	findGroupUser(findkey, callback) {
		pool.query("SELECT * FROM group_users WHERE group_id = $1;",
		[findkey.id],
		function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

	findOneGroupUser(findkey, callback) {
		pool.query("SELECT * FROM group_users WHERE group_id = $1 AND user_id = $2;",
		[findkey.id, findkey.userId],
		function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

	findOneGroupChallenge(findkey, callback) {
		pool.query("SELECT * FROM group_users WHERE group_id = $1 AND user_id IN ($2, $3);",
		[findkey.id, findkey.userId, findkey.challengedId],
		function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

	findOneRanking(findkey, callback) {
		pool.query("SELECT * FROM rankig_users WHERE group_id = $1 ORDER BY points;",
		[findkey.id],
		function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

	findOneChallenge(findkey, callback) {
		pool.query("SELECT * FROM challenges WHERE group_id = $1 AND challenger_id = $2 AND challenged_id = $3;",
		[findkey.id, findkey.userId, findkey.challengedId],
		function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

	findOneChallengeById(findkey, callback) {
		pool.query("SELECT * FROM challenges WHERE id = $1;",
		[findkey.id],
		function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

	findOneOpenChallenge(findkey, callback) {
		pool.query("SELECT * FROM challenges WHERE group_id = $1 AND challenger_id = $2 AND challenged_id = $3 AND status IN ('C', 'A');",
		[findkey.id, findkey.userId, findkey.challengedId],
		function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}


/* 	find(callback) {
		MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
			var db = client.db('ranking-tennis-app-backend-db');      
			db.collection(collection).find().toArray(function(err, result) {
				callback(err, result);
			});
			client.close();	
		});
	} */

	deleteUser(findkey, callback) {
		pool.query("DELETE FROM users WHERE id = $1",
		[findkey.id ], function(err, result) {
			
			callback(err, result);
			pool.end;
		});
    }

	/* delete(findkey, entity, callback) {
		MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
			var db = client.db('ranking-tennis-app-backend-db');      
			db.collection(collection).findByIdAndRemove(findkey, function(err, result) {
				callback(err, result);
			});
			client.close();	
		});
    } */

	updateUser(findkey, entity, callback) {
		pool.query("UPDATE users set password = $1 WHERE id = $2",
		[entity.password, findkey.id ], function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

	updateGroupUser(findkey, entity, callback) {
		pool.query("DELETE FROM group_users WHERE group_id = $1", 
		[findkey.id], function(err, result) {
			pool.end;
			if (err) callback(err, result);
			var query = 'INSERT INTO group_users (group_id, user_id, flag_admin, approved) SELECT group_id, user_id, flag_admin, approved FROM jsonb_to_recordset(\''+ JSON.stringify(entity) +'\') r (group_id integer, user_id integer, flag_admin boolean, approved boolean);';
			pool.query(query, function(err, result) {
				callback(err, result);
				pool.end;
			});
		});
	}

	updateChallenge(findkey, entity, callback) {
		pool.query("UPDATE challenges set status = $1 WHERE id = $2",
		[entity.status, findkey.id ], function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

	upsertProfile(findkey, entity, callback) {
		pool.query("SELECT * FROM profiles WHERE user_id = $1",
		[findkey.id ], function(err, result) {
			pool.end;
			if (result.rowCount == 1) {
				pool.query("UPDATE profiles SET name=$1, nickname=$2, birthdate=$3, sex=$4, height=$5, weight=$6, handed=$7, backhand=$8 WHERE user_id=$9;",
				[entity.nome, entity.apelido, entity.data_nascimento, entity.sexo, entity.altura, entity.peso, entity.empunhadura, entity.backhand, findkey.id], function(err, result) {
					callback(err, result);
					pool.end;
				});
			} else if (result.rowCount == 0) {
				pool.query("INSERT INTO profiles(user_id, name, nickname, birthdate, sex, height, weight, handed, backhand) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);",
				[findkey.id, entity.nome, entity.apelido, entity.data_nascimento, entity.sexo, entity.altura, entity.peso, entity.empunhadura, entity.backhand], function(err, result) {
					callback(err, result);
					pool.end;
				});
			}
		});
	}

	upsertChallenge(findkey, entity, callback) {
		pool.query("SELECT * FROM challenges WHERE user_id = $1",
		[findkey.id ], function(err, result) {
			pool.end;
			if (result.rowCount == 1) {
				pool.query("UPDATE profiles SET name=$1, nickname=$2, birthdate=$3, sex=$4, height=$5, weight=$6, handed=$7, backhand=$8 WHERE user_id=$9;",
				[entity.nome, entity.apelido, entity.data_nascimento, entity.sexo, entity.altura, entity.peso, entity.empunhadura, entity.backhand, findkey.id], function(err, result) {
					callback(err, result);
					pool.end;
				});
			} else if (result.rowCount == 0) {
				pool.query("INSERT INTO profiles(user_id, name, nickname, birthdate, sex, height, weight, handed, backhand) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);",
				[findkey.id, entity.nome, entity.apelido, entity.data_nascimento, entity.sexo, entity.altura, entity.peso, entity.empunhadura, entity.backhand], function(err, result) {
					callback(err, result);
					pool.end;
				});
			}
		});
	}

	insertChallenge(entity, callback) {
		pool.query("INSERT INTO challenges(group_id, challenger_id, challenged_id, date) VALUES ($1, $2, $3, now()) RETURNING id;",
		[entity.id, entity.userId, entity.challengedId], function(err, result) {
			callback(err, result);
			pool.end;
		});
	}

	insertGroup(findkey, entity, callback) {
		pool.query("INSERT INTO groups(name, group_type) VALUES ($1, $2) RETURNING id;",
			[entity.nome, entity.tipo], function(err, result) {
			callback(err, result);
			pool.end;
		});
	}

	insertAdmin(findkey, entity, callback) {
		pool.query("INSERT INTO group_users(user_id, group_id, flag_admin, approved) VALUES ($1, $2, $3, $4);",
		[entity.userId, entity.groupId, true, true], function(err, result) {
			callback(err, result);
			pool.end;
		});
	}

	insertUserGroup(entity, callback) {
		pool.query("INSERT INTO group_users(user_id, group_id, flag_admin, approved) VALUES ($1, $2, $3, $4);",
		[entity.userId, entity.groupId, false, false], function(err, result) {
			callback(err, result);
			pool.end;
		});
	}

	insertResult(findkey, entity, callback) {
		var query = 'INSERT INTO challenge_results(challenge_id, round, challenger, challenged) SELECT $1, round, challenger, challenged FROM jsonb_to_recordset(\''+ JSON.stringify(entity) +'\') r (challenge_id integer, round integer, challenger numeric, challenged numeric);';
		pool.query(query, 
		[findkey.id], function(err, result) {
			callback(err, result);
			pool.end;
		});
	}
	

	// upsertProfile(findkey, entity, callback) {
	// 	MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
	// 		var db = client.db('ranking-tennis-app-backend-db');      
	// 		db.collection(collection).updateOne(findkey, {  $set: entity }, { upsert: true }, function(err, result) {
	// 			callback(err, result);
	// 		});
	// 		client.close();	
	// 	});
	// }

};
module.exports = DbRepo;
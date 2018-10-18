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

	insertUser(collection, entity, callback) {
		pool.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id",
		[entity.email, entity.password], function(err, result) {
			
			callback(err, result);
			console.log (err, result);
			pool.end;
		});
	}

	loginUser(collection, entity, callback) {
		pool.query("SELECT * FROM users WHERE email = $1",
		[entity.email], function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

/* 	insertOne(collection, entity, callback) {
		MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
			var db = client.db('ranking-tennis-app-backend-db');      
			db.collection(collection).insertOne(entity, function(err, result) {
				callback(err, result);
			});
			client.close();	
		});
	}
 */
	findOneUser(collection, findkey, callback) {
		pool.query("SELECT * FROM users WHERE email = $1",
		[findkey.email], function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

	findOneProfile(collection, findkey, callback) {
		pool.query("SELECT * FROM profiles WHERE user_id = $1",
		[findkey.id], function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}


	findOneGroup(collection, findkey, callback) {
		pool.query("SELECT g.id, g.name, g.group_type, gt.name as group_type_name, gt.tag FROM groups g, group_types gt WHERE g.group_type = gt.id AND g.id = $1",
		[findkey.id], function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}


/* 	findOne(collection, findkey, callback) {
		MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
			var db = client.db('ranking-tennis-app-backend-db');      
			db.collection(collection).findOne(findkey, function(err, result) {
				callback(err, result);
			});
			client.close();	
		});
	} */


	findUser(collection, callback) {
		pool.query("SELECT * from users",
		function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

	findProfile(collection, callback) {
		pool.query("SELECT * from profiles",
		function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

	findGroup(collection, callback) {
		pool.query("SELECT g.id, g.name, g.group_type, gt.name as group_type_name, gt.tag FROM groups g, group_types gt WHERE g.group_type = gt.id;",
		function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

	findGroupByName(collection, findkey, callback) {
		var query = "SELECT * FROM groups WHERE lower(name) like lower(\'%"+ findkey.name + "%\')";
		pool.query(query ,
		function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

	findGroupUser(collection, findkey, callback) {
		pool.query("SELECT * FROM group_users WHERE group_id = $1;",
		[findkey.id],
		function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

	findOneGroupUser(collection, findkey, callback) {
		pool.query("SELECT * FROM group_users WHERE group_id = $1 AND user_id = $2;",
		[findkey.id, findkey.userId],
		function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

/* 	find(collection, callback) {
		MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
			var db = client.db('ranking-tennis-app-backend-db');      
			db.collection(collection).find().toArray(function(err, result) {
				callback(err, result);
			});
			client.close();	
		});
	} */

	deleteUser(collection, findkey, callback) {
		pool.query("DELETE FROM users WHERE id = $1",
		[findkey.id ], function(err, result) {
			
			callback(err, result);
			pool.end;
		});
    }

	/* delete(collection, findkey, entity, callback) {
		MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
			var db = client.db('ranking-tennis-app-backend-db');      
			db.collection(collection).findByIdAndRemove(findkey, function(err, result) {
				callback(err, result);
			});
			client.close();	
		});
    } */

	updateUser(collection, findkey, entity, callback) {
		pool.query("UPDATE users set password = $1 WHERE id = $2",
		[entity.password, findkey.id ], function(err, result) {
			
			callback(err, result);
			pool.end;
		});
	}

	updateGroupUser(collection, findkey, entity, callback) {
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

	

	upsertProfile(collection, findkey, entity, callback) {
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

	insertGroup(collection, findkey, entity, callback) {
		pool.query("INSERT INTO groups(name, group_type) VALUES ($1, $2) RETURNING id;",
			[entity.nome, entity.tipo], function(err, result) {
			callback(err, result);
			pool.end;
		});
	}

	insertAdmin(collection, findkey, entity, callback) {
		pool.query("INSERT INTO group_users(user_id, group_id, flag_admin, approved) VALUES ($1, $2, $3, $4);",
		[entity.userId, entity.groupId, true, true], function(err, result) {
			callback(err, result);
			pool.end;
		});
	}

	insertUserGroup(collection, entity, callback) {
		pool.query("INSERT INTO group_users(user_id, group_id, flag_admin, approved) VALUES ($1, $2, $3, $4);",
		[entity.userId, entity.groupId, false, false], function(err, result) {
			callback(err, result);
			pool.end;
		});
	}

	

	// upsertProfile(collection, findkey, entity, callback) {
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
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


	upsertProfile(collection, findkey, entity, callback) {
		pool.query("SELECT * FROM profiles WHERE user_id = $1",
		[findkey.id ], function(err, result) {
			pool.end;
			if (result.rowCount == 1) {
				pool.query("UPDATE public.profiles SET nome=$1, apelido=$2, data_nascimento=$3, sexo=$4, altura=$5, peso=$6, empunhadura=$7, backhand=$8 WHERE user_id=$9;",
				[entity.nome, entity.apelido, entity.data_nascimento, entity.sexo, entity.altura, entity.peso, entity.empunhadura, entity.backhand, findkey.id], function(err, result) {
					callback(err, result);
					pool.end;
				});
			} else if (result.rowCount == 0) {
				pool.query("INSERT INTO public.profiles(user_id, nome, apelido, data_nascimento, sexo, altura, peso, empunhadura, backhand) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);",
				[findkey.id, entity.nome, entity.apelido, entity.data_nascimento, entity.sexo, entity.altura, entity.peso, entity.empunhadura, entity.backhand], function(err, result) {
					callback(err, result);
					pool.end;
				});
			}
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
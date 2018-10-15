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
		pool.query("INSERT INTO users (email, password) VALUES ($1, $2)",
		[entity.email, entity.password], function(err, result) {
			
			callback(err, result);
			console.log (err, result);
			pool.end;
		});
	}

	logintUser(collection, entity, callback) {
		pool.query("SELECT * FROM users WHERE email = $1",
		[entity.email], function(err, result) {
			
			callback(err, result);
			console.log (err, result);
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
	findOne(collection, findkey, callback) {
		MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
			var db = client.db('ranking-tennis-app-backend-db');      
			db.collection(collection).findOne(findkey, function(err, result) {
				callback(err, result);
			});
			client.close();	
		});
	}

	find(collection, callback) {
		MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
			var db = client.db('ranking-tennis-app-backend-db');      
			db.collection(collection).find().toArray(function(err, result) {
				callback(err, result);
			});
			client.close();	
		});
	}

	delete(collection, findkey, entity, callback) {
		MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
			var db = client.db('ranking-tennis-app-backend-db');      
			db.collection(collection).findByIdAndRemove(findkey, function(err, result) {
				callback(err, result);
			});
			client.close();	
		});
    }

	update(collection, findkey, entity, callback) {
		MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
			var db = client.db('ranking-tennis-app-backend-db');      
			db.collection(collection).updateOne(findkey, {  $set: entity }, function(err, result) {
				callback(err, result);
			});
			client.close();	
		});
	}


	upsert(collection, findkey, entity, callback) {
		MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
			var db = client.db('ranking-tennis-app-backend-db');      
			db.collection(collection).updateOne(findkey, {  $set: entity }, { upsert: true }, function(err, result) {
				callback(err, result);
			});
			client.close();	
		});
	}
};
module.exports = DbRepo;
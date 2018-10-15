'use strict'
//console.log('2.0');

var config = require("./protected-config");


var MongoClient = require('mongodb').MongoClient;
//assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var url = config.url;

class DbRepo {
  
	insertOne(collection, entity, callback) {
		MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
			var db = client.db('ranking-tennis-app-backend-db');      
			db.collection(collection).insertOne(entity, function(err, result) {
				callback(err, result);
			});
			client.close();	
		});
	}

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
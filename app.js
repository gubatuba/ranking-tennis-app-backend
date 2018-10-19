var DbRepo = require('./app-db');
var express = require('express');
var app = express();

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
})); 

var ProfileController = require('./controllers/ProfileController');
app.use('/profiles', ProfileController);

var GroupController = require('./controllers/GroupController');
app.use('/groups', GroupController);

var UserController = require('./controllers/UserController')
app.use('/users', UserController);

var RankingController = require('./controllers/RankingController')
app.use('/rankings', RankingController);

module.exports = app;
var app = require('./app');
var port = process.env.PORT || 1337;

var server = app.listen(port, function () {
	console.log('listening on port ' + port);
})


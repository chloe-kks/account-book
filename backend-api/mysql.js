var mysql = require('mysql');
var conf = require('./config');

var connection = mysql.createConnection({
	host	: 'localhost',
	user	: 'root',
	password: conf.pw,
	database: 'accountbook'
});

connection.connect();

connection.query('SELECT * FROM USERINFO', function (error, results, fields) {
	if (error) {
		console.log(error);
	}
	console.log(results);
});

connection.end();

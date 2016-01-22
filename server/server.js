var express = require('express');
var app = express();
var __dirname = '../client';
var mysql = require('mysql');

// First you need to create a connection to the db
var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'db',
  database: 'test_db'
});

con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

con.query('SELECT * FROM testing',function(err,rows){
  if(err) throw err;

  console.log('Data received from Db:\n');
  console.log(rows);
});

con.end(function(err) {
  // The connection is terminated gracefully
  // Ensures all previously enqueued queries are still
  // before sending a COM_QUIT packet to the MySQL server.
});

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.get('/', function (req, res) {
  res.render('default.html');
});

app.listen(80, function () {
  console.log('Example app listening on port 80!');
});

// leaves the server up when exception occurs

process.on('uncaughtException', function (err) {
    console.log(err);
}); 

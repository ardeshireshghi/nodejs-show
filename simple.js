console.log('hello');

var express = require('express');
var app = express();

app.get('/test', function(req, res){
  
  res.send('<h1>Our new server</h1>');
});

app.listen(3800);
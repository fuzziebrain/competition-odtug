const
  express = require('express'),
  proxy = require('http-proxy-middleware');

var app = express();

app.get('/', function(req, res, next){
  res.redirect('/pls/apex/f?p=16557:1');
});

app.use('**', proxy(
  {
    target: 'https://apex.oracle.com',
    changeOrigin: true
  }
));

app.listen(80);
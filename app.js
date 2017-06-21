const
  express = require('express'),
  proxy = require('http-proxy-middleware')
  https = require('https')
  fs = require('fs');

var app = express();

var sslEnabled = false;

var sslOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

app.get('/', function(req, res, next){
  res.redirect('/pls/apex/f?p=16557:1');
});

app.use(['/i', '/pls/apex'], proxy(
  {
    target: 'https://apex.oracle.com',
    changeOrigin: true,
    onProxyRes: function(proxyRes, req, res) {
      if (!req.connection.encrypted && proxyRes.headers['set-cookie']) {
        var cookies = [];
        proxyRes.headers['set-cookie'].forEach(function(element) {
          element = element.replace(' secure;', '');
          cookies.push(element);
        });
      }
    }
  }
));

if (sslEnabled) {
  https.createServer(sslOptions, app).listen(process.env.PORT || 3000);
} else {
  app.listen(process.env.PORT || 3000);
} 
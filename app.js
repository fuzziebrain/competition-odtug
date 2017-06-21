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

var targetUrl = 'https://apex.oracle.com';

app.get('/', function(req, res, next){
  res.redirect('/pls/apex/f?p=16557:1');
});

app.use(['/i', '/pls/apex'], proxy(
  {
    target: targetUrl,
    changeOrigin: true,
    autoRewrite: true,
    xfwd: true,
    protocolRewrite: sslEnabled ? 'https' : 'http',
    onProxyReq: function(proxyReq, req, res) {
      proxyReq.setHeader('origin', targetUrl);
    },
    onProxyRes: function(proxyRes, req, res) {
      if (!req.connection.encrypted && proxyRes.headers['set-cookie']) {
        var cookies = [];
        proxyRes.headers['set-cookie'].forEach(function(element) {
          element = element.replace(' secure;', '');
          cookies.push(element);
        });
        proxyRes.headers['set-cookie'] = cookies;
      }
    }
  }
));

if (sslEnabled) {
  https.createServer(sslOptions, app).listen(process.env.PORT || 3000);
} else {
  app.listen(process.env.PORT || 3000);
} 
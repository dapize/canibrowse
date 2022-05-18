const fs = require('fs');
const express = require('express');
const https = require('https');
const helmet = require('helmet');
const hsts = require('hsts');
const compression = require('compression');

const build = require('./builder');

if (!fs.existsSync(__dirname + '/dist')) build.default.init.call(build.default);

const objHsts = {
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
};

const shouldCompress = (req, res) => {
  if (req.headers['x-no-compression']) return false
  return compression.filter(req, res)
}

// set up plain http server
const http = express();
http.get('*', (req, res) => {
  res.redirect('https://' + req.headers.host + req.url);
})
http.use(helmet({ contentSecurityPolicy: false }));
http.use(hsts(objHsts));
http.use(compression({ filter: shouldCompress }))
http.listen(80);

// set up https
const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(hsts(objHsts));
app.use(compression({ filter: shouldCompress }))
app.use(express.static(__dirname + '/dist'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html')
});

const PORT = 443;
const httpsServer = https.createServer({
  ca: fs.readFileSync(__dirname + "/ssl/ca_bundle.crt", 'utf8'),
  key: fs.readFileSync(__dirname + "/ssl/private.key", 'utf8'),
  cert: fs.readFileSync(__dirname + "/ssl/certificate.crt", 'utf8')
}, app);
httpsServer.listen(PORT, () => console.log(`server is running at 127.0.0.1:${PORT}`));

const fs = require('fs');
const express = require('express');
const https = require('https');
const helmet = require('helmet');
const hsts = require('hsts');

const build = require('./builder');
const basicAuth = require('./auth');
const watcher = require('./watch');

if (!fs.existsSync(__dirname + '/dist')) build.default.init.call(build.default);

const dotenv = require('dotenv');
dotenv.config();

const objHsts = {
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
};

// set up plain http server
const http = express();
http.get('*', (req, res) => {
  res.redirect('https://' + req.headers.host + req.url);
})
http.use(helmet());
http.use(hsts(objHsts));
http.listen(80);

// set up https
const app = express();
app.use(helmet());
app.use(hsts(objHsts));
app.use(basicAuth);
app.use(express.static(__dirname + '/dist'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html')
});

app.get('/start', (req, res) => {
  console.log('watcher started');
  res.send('started');
  watcher.default();
});

const PORT = 443;
const httpsServer = https.createServer({
  ca: fs.readFileSync(__dirname + "/ssl/ca_bundle.crt", 'utf8'),
  key: fs.readFileSync(__dirname + "/ssl/private.key", 'utf8'),
  cert: fs.readFileSync(__dirname + "/ssl/certificate.crt", 'utf8')
}, app);
httpsServer.listen(PORT, () => console.log(`server is running at 127.0.0.1:${PORT}`));

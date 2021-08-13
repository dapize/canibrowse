const build = require('./builder');
const basicAuth = require('./auth');
const fs = require('fs');

if (!fs.existsSync(__dirname + '/dist')) build.default.init.call(build.default);

const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();

app.use(basicAuth);

const port = process.env.PORT || 3000;

app.listen( port, () => {
  console.log(`App listening on port ${port}`)
});

app.use(express.static(__dirname + '/dist'))

app.get('/', ( req, res ) => {
  res.sendFile(__dirname + '/dist/index.html')
});

app.get('/start', ( req, res ) => {
  console.log('watcher started');
  res.send('started');
  setInterval(() => {
    build.default.init.call(build.default);
  }, 3600000)
});

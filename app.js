const build = require('./builder');
const basicAuth = require('./auth');

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
  res.send('started');
  setInterval(() => {
    build.default.init.call(build.default);
  }, 3600000)
});

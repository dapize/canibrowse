const build = require('./builder');

exports.default = setInterval(() => {
  console.log('watcher running')
  build.default.init.call(build.default);
}, 3600000)

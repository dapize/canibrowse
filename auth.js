const auth = require('basic-auth');
const compare = require('tsscmp');

const check = (name, pass) => {
  let valid = true;   // Simple method to prevent short-circuit and use timing-safe compare
  valid = compare(name, process.env.USER) && valid;
  valid = compare(pass, process.env.PASSWORD) && valid;

  return valid;
};

const basicAuth = (req, res, next) => {
  if (req.url.includes('start')) {
    const credentials = auth(req);
    if (credentials && check(credentials.name, credentials.pass)) return next();

    res.set('WWW-Authenticate', 'Basic realm="Can I browse"');
    return res.status(401).send("🙅🏻 no pe causa :V");
  } else {
    return next();
  }
};

module.exports = basicAuth;

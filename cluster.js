const path = require('path');
const cluster = require('cluster');
const express = require('express');
const passport = require('passport');
const Strategy = require('passport-http-bearer').Strategy;
const ImgSrv = require('express-sharp-server');
const CacheMgr = require('express-sharp-server/lib/CacheMgr');
const { winston, morgan } = require('./logger.js');

const options = {
  base_route: '/',
  base_url: '/',
  upload_dir: path.join(__dirname, 'data', 'uploads') + path.sep,
  cache_dir: path.join(__dirname, 'data', 'cache') + path.sep,
  logger: winston
};

const User = require('./User');

passport.use(new Strategy(
  function (token, done) {
    if (token === User.token) {
      return done(null, User, { scope: 'all' });
    } else {
      return done(null, false);
    } 
  }));

const numCPUs = 4; // require('os').cpus().length;

if (cluster.isMaster) {
  new CacheMgr(cluster);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} 
else {
  const app = express();

  app.post(options.base_route,
    passport.authenticate('bearer', { session: false }),
    function(req, res, next) { next(); });
  
  app.put(options.base_route + ':guid',
    passport.authenticate('bearer', { session: false }),
    function(req, res, next) { next(); });

  app.use(morgan);
  app.use(ImgSrv(options));

  app.listen(61235);
}
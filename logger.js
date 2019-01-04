const morgan = require('morgan');
const path = require('path');
const rfs = require('rotating-file-stream');

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, prettyPrint } = format;

const winston = createLogger({
  format: combine(
    timestamp(),
    prettyPrint()
  ),
  transports: [
    // new transports.Console(),
    new transports.File({ 
        filename: path.join(__dirname, 'logs', 'combined.log'),
        handleExceptions: true,
        json: true
    })
  ]
});

const accessLogStream = rfs('access.log', {
  interval: '1d',
  path: path.join(__dirname, 'logs')
});

module.exports = {
    winston: winston,
    morgan: morgan('combined', { stream: accessLogStream })
}
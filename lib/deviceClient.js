const Emitter = require('events').EventEmitter;
const util = require('util');
const bunyan = require('bunyan');
const bformat = require('bunyan-format');

const formatted = bformat({ outputMode: 'short', color: true });
const log = bunyan.createLogger({
  name: 'Device',
  level: process.env.LOG_LEVEL || 'info',
  stream: formatted,
  serializers: bunyan.stdSerializers
});

const Device = function () {

  //////////////////////////////

  Emitter.call(this);
  let self = this;
  let continueWith = null;

  const sampleFunction = function sampleFunction() {
    log.debug("This is Sample Function");

    if (continueWith) continueWith(null, true);
  };


  /////////////////////////////////////////

  // Self Hookups

  self.exposedFunction = (done) => {
    log.debug('data dump', 'DeviceClient.exposedFunction()');
    continueWith = done;

    return self.emit('sample-function');
  };

  // Event Wireup
  self.on('sample-function', sampleFunction);

  log.debug('Object has been initialized');
  return self;
};

util.inherits(Device, Emitter);
module.exports = Device;

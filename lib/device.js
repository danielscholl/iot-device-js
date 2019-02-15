const bunyan = require('bunyan');
const bformat = require('bunyan-format');
const formatted = bformat({ outputMode: 'short', color: true });
const log = bunyan.createLogger({
  name: 'SimpleDevice',
  level: process.env.LOG_LEVEL || 'info',
  stream: formatted,
  serializers: bunyan.stdSerializers
});

const Device = function (config, Model) {
  const Client = require('azure-iot-device').Client;
  const Message = require('azure-iot-device').Message;
  const Protocol = require('azure-iot-device-amqp').Amqp;
  const Package = require('../package');

  let self = this;
  let client = Client.fromConnectionString(config.connectionString, Protocol);

  if (!config.options || !config.options.cert || !config.options.key) {
    log.info('-----------------SYMETRICKEY------------------');
  } else {
    log.info('--------------------X509----------------------');
  }

  client.setOptions(config.options);

  let intervalLoop = null;

  //////////////////////// INITIALIZATION DONE

  const receiveMessage = (request, response) => {

    const receiveResponse = (err) => {
      if (err) {
        log.error('An error ocurred when sending a method response:\n' + err.toString());
      } else {
        log.info('Response to method \'' + request.methodName + '\' sent successfully.');
      }
    };

    log.info('Direct method payload received:');
    log.info(request.payload);

    if (isNaN(request.payload)) {
      log.info('Invalid interval response received in payload');
      response.send(400, 'Invalid direct method parameter: ' + request.payload, receiveResponse);

    } else {
      config.interval = request.payload * 1000;

      clearInterval(intervalLoop);
      self.sendMessage();

      response.send(200, 'Telemetry interval set: ' + request.payload, receiveResponse);
    }
  };

  const sendMessage = () => {
    let telemetry = Model();
    telemetry.windSpeed = 10 + (Math.random() * 4);
    telemetry.humidity = 60 + (Math.random() * 20);

    let message = new Message(telemetry.toJson());
    message.properties.add('version', Package.version);

    log.info('Sending message: ' + message.getData());
    client.sendEvent(message, function (err) {
      if (err) log.error('SendEvent: ' + err.toString());
      else log.debug('SendEvent: ' + (new Date()).toUTCString());
    });
  };

  /////////////////////////////////////////

  self.sendMessage = () => {
    setInterval(sendMessage, config.interval);
  };

  client.onDeviceMethod('setInterval', receiveMessage);

  return self;
};

module.exports = Device;

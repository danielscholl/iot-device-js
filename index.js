const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;
const Protocol = require('azure-iot-device-amqp').Amqp;
const bunyan = require('bunyan');
const bformat = require('bunyan-format');
const Model = require('./lib/models');
const Package = require('./package.json');

const interval = process.env.MESSAGE_INTERVAL || 2000;
const formatted = bformat({ outputMode: 'short', color: true });
const log = bunyan.createLogger({
  name: 'Device',
  level: process.env.LOG_LEVEL || 'info',
  stream: formatted,
  serializers: bunyan.stdSerializers
});


let client = Client.fromConnectionString(process.env.DEVICE_CONNECTION_STRING, Protocol);

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) log.error(op + ' error: ' + err.toString());
    if (res) log.debug(op + ' status: ' + res.constructor.name);
  };
}

let connectCallback = (err) => {

  if (err) {
    log.error('Could not connect: ' + err.message);
    return;
  }

  log.debug('Client connected');

  client.on('message', (msg) => {
    log.info('Id: ' + msg.messageId + ' Body: ' + msg.data);
    client.complete(msg, printResultFor('completed'));
  });

  // Create a message and send it to the IoT Hub every second
  let sendInterval = setInterval(() => {

    let data = Model.Device();
    data.windSpeed = 10 + (Math.random() * 4);

    let message = new Message(data.toJson());
    message.properties.add('version', Package.version);

    log.info('Sending message: ' + message.getData());
    client.sendEvent(message, printResultFor('send'));
  }, interval);

  client.on('error', (err) => {
    log.error(err.message);
  });

  client.on('disconnect', () => {
    clearInterval(sendInterval);
    client.removeAllListeners();
    client.open(connectCallback);
  });
};

client.open(connectCallback);

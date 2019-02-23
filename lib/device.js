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

const Device = function (config, Model) {
  Emitter.call(this);
  let self = this;
  let intervalLoop = null;
  let hubClient = null;
  let dpsClient = null;

  const Package = require('../package');
  const HubClient = require('azure-iot-device').Client;
  const Message = require('azure-iot-device').Message;
  const Protocol = require('azure-iot-device-amqp').Amqp;
  const Transport = require('azure-iot-provisioning-device-amqp').Amqp;
  const ProvisioningClient = require('azure-iot-provisioning-device').ProvisioningDeviceClient;
  const is509 = typeof (config.options) === 'object';

  /////////////////////////////////////////

  let provisionDevice = () => {
    /*
      This method is responsible for sending the Provisioning Request
    */
    if (is509) log.info('DPS Attestation Type: x509');
    else log.info('DPS Attestation Type: Symmetric Key');

    dpsClient.register((err, result) => {
      if (err) {
        log.error('error registering device: ' + err.value[1].value);
      } else {
        log.info('DPS Assigned Hub: ' + result.assignedHub);
        log.info('DPS Assigned DeviceId: ' + result.deviceId);

        config.connectionString = 'HostName=' + result.assignedHub + ';DeviceId=' + result.deviceId + config.access;
        self.emit('init-hubclient'); //-> Fire Hub Initialization Event
      }
    });
  };

  let sendMessage = () => {
    /*
      This method is responsible for sending a Telemetry Event
    */
    let telemetry = Model();
    let message = new Message(telemetry.toJson());
    message.properties.add('version', Package.version);
    log.info('Sending message: ' + message.getData());

    hubClient.sendEvent(message, function (err) {
      if (err) log.error('SendEvent: ' + err.toString());
      else log.debug('SendEvent: ' + (new Date()).toUTCString());
    });
  };

  let receiveMessage = (request, response) => {
    /*
      This method is responsible for receiving a Direct Device Method
    */
    let receiveResponse = (err) => {
      if (err) log.error('An error ocurred when sending a method response:\n' + err.toString());
      else log.debug('Response to method \'' + request.methodName + '\' sent successfully.');
    };

    log.info('Direct method payload received:');
    log.info(request.payload);

    if (isNaN(request.payload)) {
      log.info('Invalid interval response received in payload');
      response.send(400, 'Invalid direct method parameter: ' + request.payload, receiveResponse);
    } else {
      response.send(200, 'Telemetry interval set: ' + request.payload, receiveResponse);
      config.interval = request.payload * 1000;

      self.emit('loop-on'); //-> Fire Infinite Loop
    }
  };

  let loopOn = () => {
    /*
      This method is responsible for Managing the Loop Cycle
    */
    clearInterval(intervalLoop);
    log.info('Message interval: ' + config.interval);
    intervalLoop = setInterval(sendMessage, config.interval);
  };

  let initializeDpsClient = () => {
    /*
      This method is responsible for Initializing the DPS SDK objects
    */
    let SecurityClient = null;
    if (is509) {
      log.info('--------------------X509----------------------');
      SecurityClient = require('azure-iot-security-x509').X509Security;
      config.access = ';x509=true';
    } else {
      log.info('-----------------SYMETRICKEY------------------');
      SecurityClient = require('azure-iot-security-symmetric-key').SymmetricKeySecurityClient;
      config.access = ';SharedAccessKey=' + config.options;
    }

    let securityClient = new SecurityClient(config.registrationId, config.options);
    let transport = new Transport();
    dpsClient = ProvisioningClient.create(config.provisionHost, config.idScope, transport, securityClient);

    self.emit('provision-device'); //-> Fire Provision Device Action
  };

  let initializeHubClient = () => {
    /*
      This method is responsible for Initializing the HUB SDK objects
    */
    hubClient = HubClient.fromConnectionString(config.connectionString, Protocol);
    hubClient.setOptions(config.options);
    hubClient.onDeviceMethod('setInterval', receiveMessage);

    self.emit('loop-on'); //-> Fire Interval Infinite Loop
  };

  /////////////////////////////////////////

  self.start = () => {
    if (!config.connectionString) {
      log.debug('Provision Host: ' + config.provisionHost);
      log.debug('Id Scope: ' + config.idScope);

      self.emit('init-dpsclient'); //-> Fire DPS SDK Initialization Event
    } else {

      let authType = 'SYMMETRICKEY';
      let deviceType = 'IOT DEVICE';

      if (config.connectionString.indexOf('GatewayHostName') > -1) {
        deviceType = 'LEAF DEVICE';
      }

      if (is509) {
        authType = 'X509';
      }
      log.info(`-----------------${deviceType} ${authType}------------------`);
      log.debug('Connection String: ' + config.connectionString);

      self.emit('init-hubclient'); //-> Fire HUB SDK Initialization Event
    }
  };

  // Event Wireup
  self.on('provision-device', provisionDevice);
  self.on('loop-on', loopOn);
  self.on('init-hubclient', initializeHubClient);
  self.on('init-dpsclient', initializeDpsClient);

  return self;
};

util.inherits(Device, Emitter);
module.exports = Device;

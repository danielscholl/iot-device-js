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
  const ProvisioningClient = require('azure-iot-provisioning-device').ProvisioningDeviceClient;
  const Transport = require('azure-iot-provisioning-device-amqp').Amqp;
  const HubClient = require('azure-iot-device').Client;
  const Message = require('azure-iot-device').Message;

  // Setup the Device Protocol
  let Protocol = null;
  switch (config.protocol) {
    case 'MQTT':
      Protocol = require('azure-iot-device-mqtt').Mqtt;
      log.info('Protocol: MQTT');
      break;
    case 'AMQP':
      log.info('Protocol: AMQP');
      Protocol = require('azure-iot-device-amqp').Amqp;
      break;
    default:
      Protocol = require('azure-iot-device-mqtt').Mqtt;
      log.info('Protocol: MQTT');
  }

  // Determine if Symmetric Key or x509
  let is509 = false;
  if (config.connectionString !== null &&
    config.connectionString !== undefined &&
    config.connectionString.indexOf('509') > -1) {
    is509 = true;
  }
  if (config.options.key &&
    config.options.cert) {
    is509 = true;
  }
  if (is509) {
    log.info('Authentication: x509');
  } else {
    log.info('Authentication: SymmetricKey');
  }

  // Determine if Down Stream Device
  let isLeaf = false;
  if (config.connectionString && process.env.EDGE_GATEWAY) {
    config.connectionString = config.connectionString + ';GatewayHostName=' + config.edgeHost;
    log.info('Gateway: ' + config.edgeHost);
    isLeaf = true;
    if (config.options.ca) log.info('Root CA: true');
  }


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
        self.start();
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

  let c2dMessage = (message) => {
    /*
      This method is responsible for receiving a Direct Device Method
    */
    log.info('Id: ' + message.messageId + ' Body: ' + message.data);
    hubClient.complete(message, log.debug('completed'));
  };

  let desiredProperties = (properties) => {
    /*
      This method is responsible for Receiving the Device Twin Desired Properties Information
    */
    log.info('Desired Properties: ' + JSON.stringify(properties));
  };

  let deviceDisconnect = () => {
    /*
      This method is responsible for Device Connection Cleanup
    */
    clearInterval(intervalLoop);
    hubClient.removeAllListeners();
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
    let options = config.options;

    let SecurityClient = require('azure-iot-security-x509').X509Security; //-> Use X509 Security Client
    config.access = ';x509=true';

    if (!is509) {
      options = config.options.token;
      SecurityClient = require('azure-iot-security-symmetric-key').SymmetricKeySecurityClient; //-> Use Symmetric Security Client
      config.access = ';SharedAccessKey=' + options;
    }

    let transport = new Transport();
    log.debug(config.options);
    let securityClient = new SecurityClient(config.registrationId, options);
    dpsClient = ProvisioningClient.create(config.provisionHost, config.idScope, transport, securityClient);

    self.emit('provision-device'); //-> Fire Provision Device Action
  };

  let initializeHubClient = () => {
    /*
      This method is responsible for Initializing the HUB SDK objects
    */
    log.debug(config.options);
    hubClient = HubClient.fromConnectionString(config.connectionString, Protocol);

    // Setup the Options and open up the connection to start looping telemetry sending
    hubClient.setOptions(config.options, (err) => {
      if (err) {
        log.error('SetOptions Error: ' + err);
      } else {
        hubClient.open(() => {
          hubClient.getTwin((err, twin) => {
            self.emit('loop-on');
            twin.on('properties.desired', desiredProperties); //-> Hook Up Desired State Twin Properties

            twin.properties.reported.update({ version: Package.version }, (err) => {
              if (err) log.error(err);
              log.info('Reported Properties: version=' + Package.version);
            });
          });

        });
      }
    });

    hubClient.on('error', (err) => log.error(err.message)); //-> Log Error Messages
    hubClient.on('disconnect', deviceDisconnect); //-> Hook Up Device Disconnect
    hubClient.on('message', c2dMessage); //-> Hook Up Cloud to Device Messages
    hubClient.onDeviceMethod('setInterval', receiveMessage); //-> Hook Up Device Direct Messages
  };

  /////////////////////////////////////////

  self.start = () => {
    let deviceType = 'IOT DEVICE';
    let authType = 'SYMMETRICKEY';
    if (isLeaf) deviceType = 'LEAF DEVICE';
    if (is509) authType = 'X509';

    if (!config.connectionString) {
      log.debug('Provision Host: ' + config.provisionHost);
      log.debug('Id Scope: ' + config.idScope);

      self.emit('init-dpsclient'); //-> Fire DPS SDK Initialization Event
    } else {
      log.info(`-----------------${deviceType} ${authType}------------------`);
      log.info('Connection String: ' + config.connectionString);

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

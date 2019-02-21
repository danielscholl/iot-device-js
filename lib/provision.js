const bunyan = require('bunyan');
const bformat = require('bunyan-format');
const formatted = bformat({ outputMode: 'short', color: true });
const log = bunyan.createLogger({
  name: 'Provision',
  level: process.env.LOG_LEVEL || 'info',
  stream: formatted,
  serializers: bunyan.stdSerializers
});


const Provision = function (config) {
  let self = this;
  let is509 = typeof (config.options) === 'object';
  let SecurityClient = require('azure-iot-security-symmetric-key').SymmetricKeySecurityClient;

  const ProvisioningClient = require('azure-iot-provisioning-device').ProvisioningDeviceClient;
  const Transport = require('azure-iot-provisioning-device-amqp').Amqp;
  let transport = new Transport();

  if (is509) {
    log.info('DPS Attestation Type: x509');
    SecurityClient = require('azure-iot-security-x509').X509Security;
  } else {
    log.info('DPS Attestation Type: Symmetric Key');
  }

  let securityClient = new SecurityClient(config.registrationId, config.options);
  let client = ProvisioningClient.create(config.provisionHost, config.idScope, transport, securityClient);

  //////////////////////// INITIALIZATION DONE


  /////////////////////////////////////////

  self.getConnectionString = (next) => {
    log.debug('Provision Host: ' + config.provisionHost);
    log.debug('Provision Host: ' + config.idScope);

    client.register(function (err, result) {
      if (err) {
        log.error('error registering device: ' + err.value[1].value);
      } else {
        let access = ';SharedAccessKey=' + config.options;
        if (is509) {
          access = ';x509=true';
        }
        let connectionString = 'HostName=' + result.assignedHub + ';DeviceId=' + result.deviceId + access;
        log.info('Assigned Hub: ' + result.assignedHub);
        log.info('Assigned DeviceId: ' + result.deviceId);
        next(connectionString);
      }
    });
  };

  return self;
};

module.exports = Provision;

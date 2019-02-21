const bunyan = require('bunyan');
const bformat = require('bunyan-format');
const formatted = bformat({ outputMode: 'short', color: true });
const log = bunyan.createLogger({
  name: 'SimpleProvision',
  level: process.env.LOG_LEVEL || 'info',
  stream: formatted,
  serializers: bunyan.stdSerializers
});


const Provision = function (config) {
  let self = this;

  const ProvisioningClient = require('azure-iot-provisioning-device').ProvisioningDeviceClient;
  const Transport = require('azure-iot-provisioning-device-amqp').Amqp;
  let transport = new Transport();

  // const Security = require('azure-iot-security-x509').X509Security;
  const Security = require('azure-iot-security-symmetric-key').SymmetricKeySecurityClient;

  let securityClient = new Security(config.registrationId, config.options);
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
        let connectionString = 'HostName=' + result.assignedHub + ';DeviceId=' + result.deviceId + ';SharedAccessKey=' + config.options;
        log.debug(connectionString);
        next(connectionString);
      }
    });
  };

  return self;
};

module.exports = Provision;

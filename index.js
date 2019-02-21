const fs = require('fs');
const Provision = require('./lib/provision');

const Device = require('./lib/device');
const Telemetry = require('./lib/models').Device;
let config = {
  connectionString: process.env.DEVICE_CONNECTION_STRING,
  interval: process.env.MESSAGE_INTERVAL || 1000,
  provisionHost: process.env.DPS_HOST,
  idScope: process.env.ID_SCOPE,
  registrationId: process.env.REGISTRATION_ID,
  options: {}
};

const cert = process.env.CERT_PATH || './cert/device-cert.pem';
const key = process.env.KEY_PATH || './cert/device-key.pem';

if (fs.existsSync(cert)) {
  config.options.cert = fs.readFileSync(cert, 'utf-8').toString();
}

if (fs.existsSync(key)) {
  config.options.key = fs.readFileSync(key, 'utf-8').toString();
}

if (process.env.SYMMETRIC_KEY) {
  config.options = process.env.SYMMETRIC_KEY;
}

// FIX THE CHRISTMAS TREE LATER GET IT TO WORK NOW
if (!config.connectionString) {
  const provision = new Provision(config);

  provision.getConnectionString((result) => {
    config.connectionString = result;

    const device = new Device(config, Telemetry);
    device.sendMessage(() => {
      process.exit(0);
    });
  });

} else {
  const device = new Device(config, Telemetry);
  device.sendMessage(() => {
    process.exit(0);
  });
}



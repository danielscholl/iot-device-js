const fs = require('fs');

const Device = require('./lib/device');
const Telemetry = require('./lib/models').Device;
let config = {
  connectionString: process.env.DEVICE_CONNECTION_STRING,
  interval: process.env.MESSAGE_INTERVAL || 1000,
  provisionHost: process.env.DPS_HOST,
  idScope: process.env.ID_SCOPE,
  registrationId: process.env.DEVICE,
  options: {}
};

const cert = process.env.CERT_PATH || './cert/device-cert.pem';
const key = process.env.KEY_PATH || './cert/device-key.pem';
let useSymmetricKey = true;

if (fs.existsSync(cert)) {
  config.options.cert = fs.readFileSync(cert, 'utf-8').toString();
  useSymmetricKey = false;
}

if (fs.existsSync(key)) {
  config.options.key = fs.readFileSync(key, 'utf-8').toString();
  useSymmetricKey = false;
}

if (useSymmetricKey) {
  config.options = process.env.SYMMETRIC_KEY || 'UNKNOWN';
}

if (config.connectionString && process.env.EDGE_GATEWAY) {
  config.connectionString = config.connectionString + ';GatewayHostName=' + process.env.EDGE_GATEWAY;
}

let device = new Device(config, Telemetry);
device.start();

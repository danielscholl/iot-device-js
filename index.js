const fs = require('fs');
const Device = require('./lib/device');
const Telemetry = require('./lib/models').Device;
const config = {
  connectionString: process.env.DEVICE_CONNECTION_STRING,
  interval: process.env.MESSAGE_INTERVAL * 1000 || 2000,
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

const device = new Device(config, Telemetry);
device.sendMessage(() => {
  process.exit(0);
});

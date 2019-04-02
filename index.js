const fs = require('fs');

const Device = require('./lib/device');
const Telemetry = require('./lib/models').Device;
const ca = process.env.CA_PATH || './cert/root-ca.pem';
const cert = process.env.CERT_PATH || './cert/device-cert.pem';
const key = process.env.KEY_PATH || './cert/device-key.pem';

let config = {
  connectionString: process.env.DEVICE_CONNECTION_STRING,
  interval: process.env.MESSAGE_INTERVAL || 1000,
  edgeHost: process.env.EDGE_GATEWAY || null,
  provisionHost: process.env.DPS_HOST || null,
  idScope: process.env.ID_SCOPE || null,
  registrationId: process.env.DEVICE || 'device',
  options: {
    token: process.env.SYMMETRIC_KEY || null
  },
  protocol: process.env.PROTOCOL || 'AMQP'
};

if (config.edgeHost === null || (config.provisionHost !== null && config.idScope !== null)) {
  if (fs.existsSync(cert)) config.options.cert = fs.readFileSync(cert, 'utf-8').toString();
  if (fs.existsSync(key)) config.options.key = fs.readFileSync(key, 'utf-8').toString();
}

if (config.edgeHost !== null) {
  if (fs.existsSync(ca)) config.options.ca = fs.readFileSync(ca, 'utf-8').toString();
}
console.log(config);
let device = new Device(config, Telemetry);
device.start();

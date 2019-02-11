# Simple Device Sample

### Environment Variables

The device only requires one environment variable to be set.

- DEVICE_CONNECTION_STRING: Connection String of the Device

For manual testing purposes if additional variables are set `npm run monitor` can be used to monitor the events

- IOTHUB: IoT Hub Name
- DEVICE: Device Name

### Create Device Identities

```bash

export DEVICE="Device"
export HUB=$(az iot hub list --resource-group $GROUP --query [].name -otsv)
export HUB_CONNECTION_STRING=$(az iot hub show-connection-string --hub-name $HUB)

# Create a Device Identity with Symetric Key
npm run device

# Create a Device Identity with x509 Certificate
npm run device:x509

```


### LocalHost

```bash
export GROUP="iot-x509-testing"
export HUB=$(az iot hub list --resource-group $GROUP --query [].name -otsv)
export HUB_CONNECTION_STRING=$(az iot hub show-connection-string --hub-name $HUB)

# Install
npm install

# Create a Device
npm run device:token      # Create Device with Token
npm run device:x509       # Create Device With x509

export DEVICE_CONNECTION_STRING=$(az iot hub device-identity show-connection-string --hub-name $HUB --device-id $DEVICE)

# Run the Device
npm start

# Monitor the Device
npm run monitor

```


### Localhost Docker

```bash
docker-compose build
docker-compose up
```

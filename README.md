# Simple Device Sample

### Environment Variables

The device only requires one environment variable to be set.

- DEVICE_CONNECTION_STRING: Connection String of the Device

For manual testing purposes if additional variables are set `npm run monitor` can be used to monitor the events

- IOTHUB: IoT Hub Name
- DEVICE: Device Name

### LocalHost Device Simulation

```bash
# Setup the Environment Variables
export GROUP="iot-x509-testing"
export DEVICE="device"
export HUB=$(az iot hub list --resource-group $GROUP --query [].name -otsv)
export HUB_CONNECTION_STRING=$(az iot hub show-connection-string --hub-name $HUB)


# Install
npm install

# Create your Device with either x509 or Symetric Key
npm run device            # Create Device with Symetric Key
npm run device:x509       # Create Device With x509

# Run the Device
npm start

# Monitor the Device in a seperate terminal session
npm run monitor

# Remove the Device
npm run clean
```

### Localhost Docker Device Simulation

```bash
docker build -t iot-device-js
docker run -it \
  -e ARM_SUBSCRIPTION_ID=$ARM_SUBSCRIPTION_ID \
  -e ARM_CLIENT_ID=$ARM_CLIENT_ID \
  -e ARM_CLIENT_SECRET=$ARM_CLIENT_SECRET \
  -e ARM_TENANT_ID=$ARM_TENANT_ID \
  -e HUB=$HUB \
  iot-device-js



ARM_SUBSCRIPTION_ID: $ARM_SUBSCRIPTION_ID
      ARM_CLIENT_ID: $ARM_CLIENT_ID
      ARM_CLIENT_SECRET: $ARM_CLIENT_SECRET
      ARM_TENANT_ID: $ARM_TENANT_ID
```

### Localhost Docker Device Simulation

```bash
# Setup the Environment Variables
export GROUP="iot-x509-testing"
export DEVICE="device"
export REGISTRY_SERVER="localhost:5000"
export HUB=$(az iot hub list --resource-group $GROUP --query [].name -otsv)


# Create a Device with "either" x509 or Symetric Key
npm run device            # Create Device with Symetric Key
npm run device:x509       # Create Device With x509

# Retrieve the Connection String
export DEVICE_CONNECTION_STRING=$(az iot hub device-identity show-connection-string --hub-name $HUB --device-id $DEVICE -otsv)

# Build and start the Container
npm run docker

# Monitor the Device in a seperate terminal session
npm run monitor

# Remove the Device
npm run docker:stop
npm run clean
```


### Azure ACI Device Simulation

```bash
# Setup the Environment Variables
export GROUP="iot-x509-testing"
export DEVICE="device"
export REGISTRY_SERVER="<docker_registry>"
export HUB=$(az iot hub list --resource-group $GROUP --query [].name -otsv)

# Create a Device with "either" x509 or Symetric Key
npm run device            # Create Device with Symetric Key
npm run device:x509       # Create Device With x509

# Retrieve the Connection String
export DEVICE_CONNECTION_STRING=$(az iot hub device-identity show-connection-string --hub-name $HUB --device-id $DEVICE -otsv)

# Build and start the Azure ACI Container
npm run aci

# Monitor the Device in a seperate terminal session
npm run monitor

# Remove the Device
npm run aci:stop
npm run clean

```

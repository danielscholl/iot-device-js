# iot-device-js

The purpose of this solution is to be able to easily deploy and run IoT Edge Devices

_PreRequisites__

The use of [direnv](https://direnv.net/) can help managing environment variables.

## Environment Variables

### Device Creation

- HUB: The desired IoT Hub to connect the device to.
- DEVICE: A unique name to use as the IoT Device


### Device Code

- DEVICE_CONNECTION_STRING: Connection string of the IoT Device


### Monitor Scripts

- HUB_CONNECTION_STRING: Connection string of the IoT Hub


### Docker

- REGISTRY_SERVER: The desired docker registry


### Auto Provisioning

- ARM_TENANT_ID: Azure Tenant hosting the subscription
- ARM_SUBSCRIPTION_ID: Azure Subscription Id hosting IoT Resources
- ARM_CLIENT_ID: Azure Principal Application id with scope for working in the Resource Group
- ARM_CLIENT_SECRET: Azure Prinicpal Application secret


### DPS Provisioning

- DPS_HOST: Azure Device Provisioning Service Host
- ID_SCOPE: Azure Device Provisioning Service ID Scopt
- REGISTRATION_ID: Azure Device Provisioning Service Registration Id
- SYMMETRIC_KEY: Azure Device Provisioning Service Symmetric Key


## LocalHost Device Simulation

```bash
# Setup the Environment Variables
export GROUP="iot-resources"
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


## Localhost Docker Device Simulation

```bash
# Setup the Environment Variables
export GROUP="iot-resources"
export DEVICE="device"
export HUB=$(az iot hub list --resource-group $GROUP --query [].name -otsv)
export HUB_CONNECTION_STRING=$(az iot hub show-connection-string --hub-name $HUB)
export REGISTRY_SERVER="localhost:5000"


# Create a Device with "either" x509 or Symetric Key
npm run device            # Create Device with Symetric Key
npm run device:x509       # Create Device With x509

# Retrieve the Connection String
export DEVICE_CONNECTION_STRING=$(az iot hub device-identity show-connection-string --hub-name $HUB --device-id $DEVICE -otsv)

# Build and Start the Container
npm run docker

# Monitor the Device in a seperate terminal session
npm run monitor

# Stop and Remove the Device
npm run docker:stop
npm run clean
```

## Localhost Docker Self Provisioning Device

```bash
# Setup the Environment Variables
export ARM_TENANT_ID="<tenant_id>"
export ARM_SUBSCRIPTION_ID="<subscription_id>"
export ARM_CLIENT_ID="<sp_id>"
export ARM_CLIENT_SECRET="<sp_key>"

export GROUP="iot-resources"
export HUB=$(az iot hub list --resource-group $GROUP --query [].name -otsv)
export REGISTRY_SERVER="localhost:5000"

# Start IoT Device as a Docdocker-compose -p device up -dker Container
docker-compose -p iot up -d

# Stop the IoT Device Container
docker-compose -p iot stop
docker-compose -p iot rm --force

## To deploy to a swarm with Replicate Sets
docker stack deploy --compose-file docker-compose.yml iot
docker stack rm iot
```

## Azure ACI Device Simulation

```bash
# Setup the Environment Variables
export GROUP="iot-resources"
export DEVICE="device"
export HUB=$(az iot hub list --resource-group $GROUP --query [].name -otsv)
export REGISTRY_SERVER="localhost:5000"

# Create a Device with "either" x509 or Symetric Key
npm run device            # Create Device with Symetric Key
npm run device:x509       # Create Device With x509

# Retrieve the Connection String
export DEVICE_CONNECTION_STRING=$(az iot hub device-identity show-connection-string --hub-name $HUB --device-id $DEVICE -otsv)

# Build and start the Azure ACI Container
npm run aci

# Monitor the Device in a seperate terminal session
npm run monitor

# Stop and rRmove the Device
npm run aci:stop
npm run clean
```

# iot-device-js

The purpose of this solution is to be able to easily deploy and run IoT Devices to test different features.

__PreRequisites__

Requires the use of [direnv](https://direnv.net/).  
Requires the use of [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest).  
Requires the use of [Docker](https://www.docker.com/get-started).  


### Related Repositories

- [iot-resources](https://github.com/danielscholl/iot-resources)  - Deploying IoT Resources and x509 Management
- [iot-device-edge](https://github.com/danielscholl/iot-device-edge) - Simple Edge Testing
- [iot-device-js](https://github.com/danielscholl/iot-device-js) - Simple Device Testing
- [iot-control-js](https://github.com/danielscholl/iot-control-js) - Simple Control Testing


### Supported Use Cases

1. __Localhost Device Symmetric Key__

    _On a localhost register a device using Symmetric Key Authentication and send telemetry data_

1. __Docker Device Symmetric Key__

    _Within a container register a device using Symmetric Key Authentication and send telemetry data_

1. __ACI Device Symmetric Key__

    _Within ACI register a device using Symmetric Key Authentication and send telemetry data_

1. __Device Provisioning Service Symmetric Key Attestation__

    _Either from localhost or Docker request from DPS hub connection information using Symmetric Key with Individual Enrollments and send telemetry data_

1. __Localhost Device x509__

    _On a localhost register a device using x509 Certificate Authentication and send telemetry data_

1. __Docker Device x509__

    _Within a container register a device using x509 Certificate Authentication and send telemetry data_

1. __ACI Device x509__

    _Within ACI register a device using x509 Certificate Authentication and send telemetry data_

1. __Device Provisioning Service x509 Attestation__

    _Either from localhost or Docker request from DPS hub connection information using x509 Certs for either Individual or Group Enrollments and send telemetry data_

1. __Receive and act on Direct Method__

    _Receive a DirectMethod Message to change the interval time for sending telemetry ata_

__PreRequisites__

The use of [direnv](https://direnv.net/) can help managing environment variables.

## Environment Variables

### Device Creation

- HUB: The desired IoT Hub to connect the device to.
- DEVICE: A unique name to use as the IoT Device


### Device

- DEVICE_CONNECTION_STRING: Connection string of the IoT Device
- EDGE_GATEWAY: IP Address of IoT Edge Device (Optional)


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

# Option A:  Self register a Device with either Symmetric Key or a self signed x509 Certificate
npm run device            # Create Device with Symetric Key
npm run device:x509       # Create Device With x509

# Option B: DPS Register a Device with Symmetric Key
export REGISTRATION_ID=$DEVICE
export DPS_HOST="$(az iot dps list --resource-group $GROUP -ojson --query [0].properties.deviceProvisioningHostName -otsv)"
export ID_SCOPE="$(az iot dps list --resource-group $GROUP -ojson --query [0].properties.idScope -otsv)"
export SYMMETRIC_KEY=$(az iot dps enrollment create \
  --resource-group $GROUP \
  --dps-name $(az iot dps list --resource-group $GROUP -ojson --query [0].name -otsv) \
  --enrollment-id $REGISTRATION_ID \
  --attestation-type symmetrickey --query attestation.symmetricKey.primaryKey -otsv)

# Option C: DPS Register a Device with x509 Certificates
# Copy Certs to cert directory with proper naming convention
# Create either Individual Enrollment or Group Enrollment using CA

# Run the Device
DEVICE_CONNECTION_STRING=$(az iot hub device-identity show-connection-string --hub-name $HUB --device-id $DEVICE -otsv)
npm start

# Monitor the Device in a seperate terminal session
npm run monitor

# Remove the Device
npm run clean
```


## Docker Device Simulation

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

npm run docker

# Monitor the Device in a seperate terminal session
npm run monitor

# Stop and Remove the Device
npm run docker:stop
npm run clean
```

## Docker DPS Device Simulation

> Follow these instructions from the dps folder only!!

1. Create the DPS Enrollments as necessary

1. If appropriate copy the x509 certs to the cert directory with the proper naming convention

1. Set the Environment variables in the .envrc file as appropriate

Deploy with docker-compose
```bash
# Deploy using Symmetric Key Attestation
docker-compose -f docker-compose.key.yml -p dps up

# Deploy using X509 Attestation  ** MAKE SURE CERTS EXIST **
docker-compose -f docker-compose.509.yml -p dps up
```

Deploy to ACI
```bash
  ./deploy.sh
  az container logs  --resource-group ${GROUP} --name ${REGISTRATION_ID} --follow
  az container delete --resource-group ${GROUP} --name ${REGISTRATION_ID} --yes -oyaml
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

# Start the IoT Device Container
docker-compose -p iot up -d

# Stop the IoT Device Container
docker-compose -p iot stop
docker-compose -p iot rm --force

## To deploy to a swarm with Replicate Sets
docker stack deploy --compose-file docker-compose.yml iot
docker stack rm iot
```

## Docker Swarm Service

```bash
export ARM_TENANT_ID="<tenant_id>"
export ARM_SUBSCRIPTION_ID="<subscription_id>"
export ARM_CLIENT_ID="<sp_id>"
export ARM_CLIENT_SECRET="<sp_key>"
export HUB=$(az iot hub list --resource-group $GROUP --query [].name -otsv)
export EDGE_GATEWAY="<edge_gateway>"

docker service create \
  --replicas 20 \
  --name iot \
  --constraint node.role!=manager \
  --mount type=volume,volume-driver=cloudstor:azure,source=cert,destination=/usr/src/app/cert \
  --env ARM_TENANT_ID=$ARM_TENANT_ID \
  --env ARM_SUBSCRIPTION_ID=$ARM_SUBSCRIPTION_ID \
  --env ARM_CLIENT_ID=$ARM_CLIENT_ID \
  --env ARM_CLIENT_SECRET=$ARM_CLIENT_SECRET \
  --env HUB=$HUB \
  --env EDGE_GATEWAY=$EDGE_GATEWAY \
  danielscholl/iot-device-js:provision
```

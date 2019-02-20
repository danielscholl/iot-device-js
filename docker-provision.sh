#!/usr/bin/env bash
#
#  Purpose: Create a IoT Device and send telemetry
#  Usage:
#    docker-provision.sh


###############################
## ARGUMENT INPUT            ##
###############################

usage() { echo "Usage: docker-provision.sh " 1>&2; exit 1; }

if [ -f ./.envrc ]; then source ./.envrc; fi

function provisionDevice()
{
  tput setaf 2; echo "Authenticating the CLI" ; tput sgr0
  tput setaf 3; echo "------------------------------------" ; tput sgr0
  az login \
    --service-principal \
    --username $ARM_CLIENT_ID \
    --password $ARM_CLIENT_SECRET \
    --tenant $ARM_TENANT_ID

  az account set \
    --subscription $ARM_SUBSCRIPTION_ID


  tput setaf 2; echo "Creating IoT Edge Device" ; tput sgr0
  tput setaf 3; echo "------------------------------------" ; tput sgr0
  DEVICE=$(hostname) npm run device


  DEVICE_CONNECTION_STRING=$(az iot hub device-identity show-connection-string \
                            --device-id $(hostname) \
                            --hub-name $HUB \
                            -otsv)
}

if [ -z "$DEVICE_CONNECTION_STRING" ]; then
    echo "No connectionString provided, provisioning as a new IoTEdge device with name: $(hostname)"
    provisionDevice
fi

tput setaf 2; echo "Start the IoT Device" ; tput sgr0
tput setaf 3; echo "------------------------------------" ; tput sgr0
DEVICE_CONNECTION_STRING=$DEVICE_CONNECTION_STRING DEVICE=$(hostname) npm start

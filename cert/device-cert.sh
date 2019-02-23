#!/usr/bin/env bash
#
#  Purpose: Create a Resource Group an Edge VM deployed to it
#  Usage:
#    get-cert.sh


###############################
## ARGUMENT INPUT            ##
###############################

usage() { echo "Usage: get-cert.sh " 1>&2; exit 1; }

if [ -f ./.envrc ]; then source ./.envrc; fi

if [ -z $1 ]; then
  GROUP="iot-resources"
else
  GROUP=$1
fi

if [ -z $2 ]; then
  VAULT=$(az keyvault list --resource-group $GROUP --query [].name -otsv)
else
  VAULT=$2
fi

printf "\n"
tput setaf 2; echo "Retrieving Required Certificates" ; tput sgr0
tput setaf 3; echo "------------------------------------" ; tput sgr0

# Download and extract PEM files for Device
az keyvault secret download --name $DEVICE --vault-name $VAULT --file $DEVICE.pem --encoding base64
openssl pkcs12 -in $DEVICE.pem -out device-cert.pem -nokeys -passin pass:
openssl pkcs12 -in $DEVICE.pem -out device-key.pem -nodes -nocerts -passin pass:
rm $DEVICE.pem


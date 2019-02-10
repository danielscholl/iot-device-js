#!/usr/bin/env bash
#
#  Purpose: Generate Device Certs and Store in Key Vault
#  Usage:
#    deploy-aci.sh


printf "\n"
tput setaf 2; echo "Creating ACI Deployment" ; tput sgr0
tput setaf 3; echo "-----------------------" ; tput sgr0

if [ -f ./cert/device-cert.pem ] && [ -f ./cert/device-key.pem ]
then
  cat > aci/deploy.yaml << EOF
apiVersion: '2018-06-01'
location: eastus
name: $DEVICE
properties:
  containers:
  - name: $DEVICE
    properties:
      environmentVariables:
        - name: 'DEVICE'
          value: '$DEVICE'
        - name: 'DEVICE_CONNECTION_STRING'
          secureValue: 'HostName=$HUB.azure-devices.net;DeviceId=$DEVICE;x509=true'
      image: danielscholl/iot-device-js:latest
      ports: []
      resources:
        requests:
          cpu: 1.0
          memoryInGB: 1.5
      volumeMounts:
      - mountPath: /usr/src/app/cert
        name: certvolume
  osType: Linux
  restartPolicy: Always
  volumes:
  - name: certvolume
    secret:
      device-cert.pem: $(openssl base64 -in ./cert/device-cert.pem |tr -d '\n')
      device-key.pem: $(openssl base64 -in ./cert/device-key.pem |tr -d '\n')
tags: {}
type: Microsoft.ContainerInstance/containerGroups
EOF
else
  echo "don't use cert"
fi


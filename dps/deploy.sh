#!/usr/bin/env bash
#
#  Purpose: Deploy to ACI
#  Usage:
#    deploy.sh


printf "\n"
tput setaf 2; echo "Creating ACI Deployment" ; tput sgr0
tput setaf 3; echo "-----------------------" ; tput sgr0

cat > deploy.yaml << EOF
apiVersion: '2018-06-01'
location: eastus
name: $REGISTRATION_ID
properties:
  containers:
  - name: $REGISTRATION_ID
    properties:
      environmentVariables:
        - name: 'DPS_HOST'
          value: '$DPS_HOST'
        - name: 'ID_SCOPE'
          value: '$ID_SCOPE'
        - name: 'REGISTRATION_ID'
          value: '$REGISTRATION_ID'
        - name: 'SYMMETRIC_KEY'
          secureValue: '$SYMMETRIC_KEY'
      image: danielscholl/iot-device-js:latest
      ports: []
      resources:
        requests:
          cpu: 1.0
          memoryInGB: 1.5
  osType: Linux
  restartPolicy: Always
tags: {}
type: Microsoft.ContainerInstance/containerGroups
EOF

az container create --resource-group ${GROUP} --file deploy.yaml -oyaml
rm deploy.yaml

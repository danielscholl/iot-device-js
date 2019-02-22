# Device Provisioning Instructions

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


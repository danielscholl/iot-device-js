# Device Provisioning Instructions

> Set the Environment variables in the .envrc file

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


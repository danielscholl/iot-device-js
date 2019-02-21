# Device Provisioning Instructions

> Set the Environment variables in the .envrc file

Deploy with docker-compose
```bash
docker-compose -p dps up
```

Deploy to ACI
```bash
  ./deploy.sh
  az container logs  --resource-group ${GROUP} --name ${REGISTRATION_ID} --follow
  az container delete --resource-group ${GROUP} --name ${REGISTRATION_ID} --yes -oyaml
```


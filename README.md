# Simple Device Sample

### Environment Variables

The device only requires one environment variable to be set.

- DEVICE_CONNECTION_STRING: Connection String of the Device

For manual testing purposes if additional variables are set `npm run monitor` can be used to monitor the events

- IOTHUB: IoT Hub Name
- DEVICE: Device Name


### LocalHost 

```bash
# Install
npm install

# Run the Device
npm start

# Monitor the Device
npm run monitor

```


### Localhost Docker

```bash
docker-compose build
docker-compose up
```


const Model = function () {
  let self = this;

  self.Device = function Device({ deviceId = process.env.DEVICE, windSpeed = 0, humdity = 0, timeStamp = Math.floor(Date.now() / 1000) } = {}) {
    return {
      deviceId: deviceId,
      windSpeed: windSpeed,
      humidity: humdity,
      timeStamp: timeStamp,
      toJson: function toJson() {
        return JSON.stringify(this);
      },
    };
  };

  return self;
};

module.exports = new Model();

const Model = function () {
  let self = this;

  self.Device = function Device({ deviceId = process.env.DEVICE, windSpeed = 10 + (Math.random() * 4), humdity = 60 + (Math.random() * 20), timeStamp = Math.floor(Date.now() / 1000) } = {}) {
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

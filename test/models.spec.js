const test = require('tape');
const Model = require('../lib/models');


test('Device Model', assert => {
  const model = Model.Device();
  assert.ok(typeof model === 'object', 'model is an object');
  assert.same("DirectDevice", model.deviceId, 'default deviceId should be DirectDevice');
  assert.same(0, model.windSpeed, 'default windSpeed should be 0');
  assert.ok(typeof model.toJson() === 'string', 'Model should serialize to JSON');
  assert.end();
});

const Test = require('tape');
const Client = require('../lib/deviceClient');

Test('Device Client', assert => {
  const client = new Client();
  client.exposedFunction((err, result) => {
    assert.ok(err === null, 'Test should pass without an error');
    assert.ok(result, 'Test should pass without a result');
    assert.end();
  });
});

Test.onFinish(() => process.exit(0));

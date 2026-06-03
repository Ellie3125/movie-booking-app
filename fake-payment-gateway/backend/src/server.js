const app = require('./app');
const env = require('./configs/env');

app.listen(env.port, () => {
  console.log(`Fake Payment Gateway running on port ${env.port}`);
});


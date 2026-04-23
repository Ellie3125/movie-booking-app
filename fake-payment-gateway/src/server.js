const app = require('./app');
const connectDB = require('./configs/db');
const env = require('./configs/env');

const startServer = async () => {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`Fake Payment Gateway running on port ${env.port}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start Fake Payment Gateway:', error);
  process.exit(1);
});

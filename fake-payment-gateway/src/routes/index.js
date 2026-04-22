const express = require('express');
const gatewayApiRoutes = require('./gatewayApi.routes');
const gatewayPageRoutes = require('./gatewayPage.routes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Fake Payment Gateway is running',
    data: {
      gatewayBasePath: '/gateway',
      apiBasePath: '/gateway/api',
    },
  });
});

router.use('/gateway/api', gatewayApiRoutes);
router.use('/gateway', gatewayPageRoutes);

module.exports = router;

const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API routes working',
    data: null
  });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const cinemaBrandController = require('../controllers/cinemaBrand.controller');

router.get('/', cinemaBrandController.listBrands);
router.get('/:id', cinemaBrandController.getBrandById);
router.post('/', cinemaBrandController.createBrand);
router.put('/:id', cinemaBrandController.updateBrand);
router.delete('/:id', cinemaBrandController.deleteBrand);

module.exports = router;

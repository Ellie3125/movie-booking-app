const express = require('express');
const router = express.Router();
const cinemaBrandController = require('../controllers/cinemaBrand.controller');
const validate = require('../middlewares/validate.middleware');
const brandValidation = require('../validations/cinemaBrand.validation');

router.get('/', cinemaBrandController.listBrands);
router.get('/:id', cinemaBrandController.getBrandById);
router.post('/', validate(brandValidation.createBrandSchema), cinemaBrandController.createBrand);
router.put('/:id', validate(brandValidation.updateBrandSchema), cinemaBrandController.updateBrand);
router.delete('/:id', cinemaBrandController.deleteBrand);

module.exports = router;

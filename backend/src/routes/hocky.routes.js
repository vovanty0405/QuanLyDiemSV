const express = require('express');
const hockyController = require('../controllers/hocky.controller');
const validate = require('../middlewares/validate');
const { createHocKySchema, updateHocKySchema } = require('../validations/hocky.validation');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(verifyToken);

router.get('/', hockyController.getAllHocKy);
router.get('/:id', hockyController.getHocKyById);

router.use(checkRole(['Admin']));

router.post('/', validate(createHocKySchema), hockyController.createHocKy);
router.put('/:id', validate(updateHocKySchema), hockyController.updateHocKy);
router.delete('/:id', hockyController.deleteHocKy);

module.exports = router;

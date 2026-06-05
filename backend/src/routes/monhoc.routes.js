const express = require('express');
const monHocController = require('../controllers/monhoc.controller');
const validate = require('../middlewares/validate');
const { createMonHocSchema, updateMonHocSchema } = require('../validations/monhoc.validation');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(verifyToken);

router.get('/', monHocController.getAllMonHoc);
router.get('/:id', monHocController.getMonHocById);

router.use(checkRole(['Admin']));

router.post('/bulk', monHocController.bulkCreateMonHoc);
router.post('/', validate(createMonHocSchema), monHocController.createMonHoc);
router.put('/:id', validate(updateMonHocSchema), monHocController.updateMonHoc);
router.delete('/:id', monHocController.deleteMonHoc);

module.exports = router;

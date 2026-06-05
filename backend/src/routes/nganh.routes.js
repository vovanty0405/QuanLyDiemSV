const express = require('express');
const nganhController = require('../controllers/nganh.controller');
const validate = require('../middlewares/validate');
const { createNganhSchema, updateNganhSchema } = require('../validations/nganh.validation');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(verifyToken);

router.get('/', nganhController.getAllNganh);
router.get('/:id', nganhController.getNganhById);

router.use(checkRole(['Admin']));

router.post('/', validate(createNganhSchema), nganhController.createNganh);
router.put('/:id', validate(updateNganhSchema), nganhController.updateNganh);
router.delete('/:id', nganhController.deleteNganh);

module.exports = router;

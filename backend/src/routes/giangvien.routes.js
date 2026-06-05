const express = require('express');
const giangVienController = require('../controllers/giangvien.controller');
const validate = require('../middlewares/validate');
const { createGiangVienSchema, updateGiangVienSchema } = require('../validations/giangvien.validation');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(verifyToken);

// Giảng viên có thể xem Profile của chính mình
router.get('/profile', checkRole(['GiangVien']), giangVienController.getProfile);

router.get('/', giangVienController.getAllGiangVien);
router.get('/:id', giangVienController.getGiangVienById);

router.use(checkRole(['Admin']));

router.post('/bulk', giangVienController.bulkCreateGiangVien);
router.post('/', validate(createGiangVienSchema), giangVienController.createGiangVien);
router.put('/:id', validate(updateGiangVienSchema), giangVienController.updateGiangVien);
router.delete('/:id', giangVienController.deleteGiangVien);

module.exports = router;

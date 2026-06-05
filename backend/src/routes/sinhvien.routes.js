const express = require('express');
const sinhVienController = require('../controllers/sinhvien.controller');
const validate = require('../middlewares/validate');
const { createSinhVienSchema, updateSinhVienSchema } = require('../validations/sinhvien.validation');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(verifyToken);

// SV có thể xem Profile của chính mình
router.get('/profile', checkRole(['SinhVien']), sinhVienController.getProfile);

// Giảng viên và Admin có thể xem danh sách
router.get('/', checkRole(['Admin', 'GiangVien']), sinhVienController.getAllSinhVien);
router.get('/:id', checkRole(['Admin', 'GiangVien']), sinhVienController.getSinhVienById);

router.use(checkRole(['Admin']));

router.post('/bulk', sinhVienController.bulkCreateSinhVien);
router.post('/', validate(createSinhVienSchema), sinhVienController.createSinhVien);
router.put('/:id', validate(updateSinhVienSchema), sinhVienController.updateSinhVien);
router.delete('/:id', sinhVienController.deleteSinhVien);

module.exports = router;

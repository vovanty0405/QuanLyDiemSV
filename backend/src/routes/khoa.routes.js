const express = require('express');
const khoaController = require('../controllers/khoa.controller');
const validate = require('../middlewares/validate');
const { createKhoaSchema, updateKhoaSchema } = require('../validations/khoa.validation');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// Tất cả API của danh mục yêu cầu đăng nhập
router.use(verifyToken);

// Sinh viên, Giảng viên có thể xem
router.get('/', khoaController.getAllKhoa);
router.get('/:id', khoaController.getKhoaById);

// Chỉ Admin mới được thêm/sửa/xóa
router.use(checkRole(['Admin']));

router.post('/', validate(createKhoaSchema), khoaController.createKhoa);
router.put('/:id', validate(updateKhoaSchema), khoaController.updateKhoa);
router.delete('/:id', khoaController.deleteKhoa);

module.exports = router;

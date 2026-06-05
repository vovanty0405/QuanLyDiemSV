const express = require('express');
const lopHocPhanController = require('../controllers/lophocphan.controller');
const validate = require('../middlewares/validate');
const { createLopHocPhanSchema, updateLopHocPhanSchema, dangKyHocPhanSchema } = require('../validations/lophocphan.validation');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(verifyToken);

// GV xem danh sách LHP mà mình đang dạy
router.get('/giangvien/my', checkRole(['GiangVien']), lopHocPhanController.getLopHocPhanByGiangVien);

// Admin, GV & Khảo Thí xem danh sách & chi tiết LHP
router.get('/', checkRole(['Admin', 'GiangVien', 'KhaoThi']), lopHocPhanController.getAllLopHocPhan);
router.get('/:id', checkRole(['Admin', 'GiangVien', 'KhaoThi']), lopHocPhanController.getLopHocPhanById);
router.put('/:id/config-grades', checkRole(['GiangVien']), lopHocPhanController.configGrades);

router.use(checkRole(['Admin']));

router.post('/bulk', lopHocPhanController.bulkCreateLopHocPhan);
router.post('/', validate(createLopHocPhanSchema), lopHocPhanController.createLopHocPhan);
router.put('/:id', validate(updateLopHocPhanSchema), lopHocPhanController.updateLopHocPhan);
router.delete('/:id', lopHocPhanController.deleteLopHocPhan);

// Đăng ký / Huỷ đăng ký Sinh Viên vào LHP
router.post('/:id/dangky', validate(dangKyHocPhanSchema), lopHocPhanController.dangKyHocPhan);
router.delete('/:id/dangky', validate(dangKyHocPhanSchema), lopHocPhanController.huyDangKy);

// Đăng ký hàng loạt (xếp lớp)
router.post('/:id/dangky-hang-loat', lopHocPhanController.dangKyHocPhanHangLoat);

module.exports = router;

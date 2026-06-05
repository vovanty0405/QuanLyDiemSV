const express = require('express');
const diemController = require('../controllers/diem.controller');
const validate = require('../middlewares/validate');
const { capNhatDiemSchema, capNhatDiemHangLoatSchema, thiLaiCaiThienSchema } = require('../validations/diem.validation');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(verifyToken);

// ====== SV xem bảng điểm cá nhân ======
router.get('/sinh-vien/bang-diem', checkRole(['SinhVien']), diemController.getBangDiemCaNhan);

// ====== Admin & GV: Quản lý điểm ======
// Xem bảng điểm của 1 SV bất kỳ
router.get('/sinh-vien/:maSV/bang-diem', checkRole(['Admin', 'GiangVien', 'KhaoThi']), diemController.getBangDiemSinhVien);

// Lấy danh sách SV + Điểm trong 1 LHP
router.get('/lophocphan/:id', checkRole(['Admin', 'GiangVien', 'KhaoThi']), diemController.getDanhSachDiemByLHP);

// Cập nhật điểm hàng loạt trong LHP (phải đặt TRƯỚC route /:maSV để tránh Express hiểu nhầm 'hang-loat' là maSV)
router.put('/lophocphan/:id/hang-loat', checkRole(['GiangVien', 'KhaoThi']), validate(capNhatDiemHangLoatSchema), diemController.capNhatDiemHangLoat);

// Chốt bảng điểm (GiangVien)
router.put('/lophocphan/:id/chot-diem', checkRole(['GiangVien']), diemController.chotDiem);

// Yêu cầu mở khóa (GiangVien)
router.post('/lophocphan/:id/yeu-cau-mo-khoa', checkRole(['GiangVien']), diemController.yeuCauMoKhoa);

// Admin mở khóa điểm
router.put('/lophocphan/:id/mo-khoa-diem', checkRole(['Admin']), diemController.moKhoaDiem);

// Cập nhật điểm 1 SV trong LHP
router.put('/lophocphan/:id/:maSV', checkRole(['GiangVien', 'KhaoThi']), validate(capNhatDiemSchema), diemController.capNhatDiem);

// Xử lý Thi lại / Cải thiện
router.put('/thi-lai/:maKQ', checkRole(['KhaoThi']), validate(thiLaiCaiThienSchema), diemController.xuLyThiLaiCaiThien);

module.exports = router;

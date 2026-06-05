const express = require('express');
const traCuuDiemController = require('../controllers/TraCuuDiemController');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(verifyToken);

// Lấy danh sách tổng quát (Dành cho Admin, GiangVien, KhaoThi)
router.get('/', checkRole(['Admin', 'GiangVien', 'KhaoThi']), traCuuDiemController.getAllStudentSummary);

// Lấy chi tiết bảng điểm 1 sinh viên (Admin, GiangVien, SinhVien, KhaoThi)
router.get('/:masv', checkRole(['Admin', 'GiangVien', 'SinhVien', 'KhaoThi']), traCuuDiemController.getStudentTranscriptDetail);

module.exports = router;

const express = require('express');
const router = express.Router();
const thongkeController = require('../controllers/thongke.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Bảo vệ tất cả route bằng verifyToken
router.use(verifyToken);

router.get('/tong-quan', thongkeController.getTongQuan);
router.get('/phan-bo-diem', thongkeController.getPhanBoDiem);
router.get('/xep-loai', thongkeController.getXepLoai);
router.get('/gpa-theo-khoa', thongkeController.getGPATheoKhoa);
router.get('/top-sinh-vien', thongkeController.getTopSinhVien);

module.exports = router;

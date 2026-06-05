const express = require('express');
const khungChuongTrinhController = require('../controllers/khungchuongtrinh.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(verifyToken);
// Admin can manage, but maybe teachers/students want to view it?
// Let's restrict write to Admin, but allow read for others.

router.get('/:maNganh', khungChuongTrinhController.getKhungDaoTaoByNganh);

router.use(checkRole(['Admin']));

router.put('/:maNganh/quydinh', khungChuongTrinhController.updateQuyDinhTotNghiep);
router.post('/:maNganh/monhoc', khungChuongTrinhController.addMonToKhung);
router.delete('/:maNganh/monhoc/:maMon', khungChuongTrinhController.removeMonFromKhung);

module.exports = router;

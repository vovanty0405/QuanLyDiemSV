const express = require('express');
const nhatKyHoatDongController = require('../controllers/nhatkyhoatdong.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(verifyToken);
// Chỉ Admin có quyền xem log
router.use(checkRole(['Admin']));

router.get('/', nhatKyHoatDongController.getAllLogs);

module.exports = router;

const express = require('express');
const thongBaoController = require('../controllers/thongbao.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware.verifyToken);

router.get('/', thongBaoController.getNotifications);
router.post('/mark-read', thongBaoController.markAsRead);

module.exports = router;

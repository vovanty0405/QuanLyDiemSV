const express = require('express');
const lopHanhChinhController = require('../controllers/lophanhchinh.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(verifyToken);

router.get('/', lopHanhChinhController.getAllLopHanhChinh);
router.get('/:id', lopHanhChinhController.getLopHanhChinhById);

// Admin only
router.use(checkRole(['Admin']));

router.post('/bulk', lopHanhChinhController.bulkCreateLopHanhChinh);
router.post('/', lopHanhChinhController.createLopHanhChinh);
router.put('/:id', lopHanhChinhController.updateLopHanhChinh);
router.delete('/:id', lopHanhChinhController.deleteLopHanhChinh);

module.exports = router;

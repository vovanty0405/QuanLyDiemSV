const express = require('express');
const khieuNaiController = require('../controllers/khieunai.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware.verifyToken);

router.post('/', khieuNaiController.createComplaint);
router.get('/', khieuNaiController.getComplaints);
router.put('/:id/process', khieuNaiController.processComplaint);

module.exports = router;

const express = require('express');
const router = express.Router();
const taikhoanController = require('../controllers/taikhoan.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// router.use(authMiddleware.protect);

router.route('/')
    .get(taikhoanController.getAccounts)
    .post(taikhoanController.createAccount);

router.route('/:id')
    .put(taikhoanController.updateAccount)
    .delete(taikhoanController.deleteAccount);

module.exports = router;

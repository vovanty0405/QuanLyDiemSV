const express = require('express');
const router = express.Router();
const phanquyenController = require('../controllers/phanquyen.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Apply auth middleware if you want
// router.use(authMiddleware.protect);

router.get('/roles', phanquyenController.getRoles);
router.get('/:roleId/permissions', phanquyenController.getRolePermissions);
router.put('/:roleId/permissions', phanquyenController.updateRolePermissions);
router.get('/:roleId/scopes', phanquyenController.getDataScopes);
router.put('/:roleId/scopes', phanquyenController.updateDataScopes);

module.exports = router;

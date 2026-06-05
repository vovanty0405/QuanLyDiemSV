const { Role, ChucNang, HanhDong, PhanQuyen, PhanQuyenPhamVi, UserAccount } = require('../models');
const AppError = require('../utils/AppError');

exports.getRoles = async (req, res, next) => {
    try {
        const roles = await Role.findAll({
            include: [{
                model: UserAccount,
                attributes: ['UserID']
            }]
        });

        const formattedRoles = roles.map(role => ({
            id: role.RoleID,
            name: role.RoleName,
            description: role.MoTa,
            userCount: role.UserAccounts ? role.UserAccounts.length : 0
        }));

        res.status(200).json({
            status: 'success',
            data: formattedRoles
        });
    } catch (error) {
        next(error);
    }
};

exports.getRolePermissions = async (req, res, next) => {
    try {
        const { roleId } = req.params;
        
        // Fetch all functions and actions
        const [chucNangs, hanhDongs, phanQuyens] = await Promise.all([
            ChucNang.findAll(),
            HanhDong.findAll(),
            PhanQuyen.findAll({ where: { RoleID: roleId } })
        ]);

        // Construct matrix
        const permissions = {};
        chucNangs.forEach(cn => {
            permissions[cn.MaChucNang] = {};
            hanhDongs.forEach(hd => {
                permissions[cn.MaChucNang][hd.MaHanhDong] = false;
            });
        });

        phanQuyens.forEach(pq => {
            if (permissions[pq.MaChucNang]) {
                permissions[pq.MaChucNang][pq.MaHanhDong] = true;
            }
        });

        res.status(200).json({
            status: 'success',
            data: {
                modules: chucNangs.map(cn => ({ id: cn.MaChucNang, name: cn.TenChucNang })),
                actions: hanhDongs.map(hd => ({ id: hd.MaHanhDong, name: hd.TenHanhDong })),
                permissions
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateRolePermissions = async (req, res, next) => {
    try {
        const { roleId } = req.params;
        const { permissions } = req.body; // format: { 'dashboard': { 'view': true, 'add': false... } }

        // Begin a transaction? Simplest is to destroy all and recreate
        await PhanQuyen.destroy({ where: { RoleID: roleId } });

        const newPermissions = [];
        for (const [moduleId, actions] of Object.entries(permissions)) {
            for (const [actionId, isGranted] of Object.entries(actions)) {
                if (isGranted) {
                    newPermissions.push({
                        RoleID: roleId,
                        MaChucNang: moduleId,
                        MaHanhDong: actionId
                    });
                }
            }
        }

        if (newPermissions.length > 0) {
            await PhanQuyen.bulkCreate(newPermissions);
        }

        res.status(200).json({
            status: 'success',
            message: 'Cập nhật phân quyền thành công'
        });
    } catch (error) {
        next(error);
    }
};

exports.getDataScopes = async (req, res, next) => {
    try {
        const { roleId } = req.params;
        const scopes = await PhanQuyenPhamVi.findAll({ where: { RoleID: roleId } });
        
        // Return as key-value pairs { [MaPhamVi]: IsActive }
        const dataScopes = {};
        scopes.forEach(s => {
            dataScopes[s.MaPhamVi] = s.IsActive;
        });

        res.status(200).json({
            status: 'success',
            data: dataScopes
        });
    } catch (error) {
        next(error);
    }
};

exports.updateDataScopes = async (req, res, next) => {
    try {
        const { roleId } = req.params;
        const { scopes } = req.body; // format: { 'scope_diem_canhan': true, ... }

        // Get current scopes to update
        for (const [scopeId, isActive] of Object.entries(scopes)) {
            const [scope, created] = await PhanQuyenPhamVi.findOrCreate({
                where: { RoleID: roleId, MaPhamVi: scopeId },
                defaults: { Module: 'Default', Rule: 'Rule', IsActive: isActive }
            });
            if (!created) {
                await scope.update({ IsActive: isActive });
            }
        }

        res.status(200).json({
            status: 'success',
            message: 'Cập nhật phạm vi dữ liệu thành công'
        });
    } catch (error) {
        next(error);
    }
};

const { UserAccount, Role, GiangVien, SinhVien } = require('../models');
const AppError = require('../utils/AppError');
const bcrypt = require('bcrypt');

exports.getAccounts = async (req, res, next) => {
    try {
        const { role, status, search } = req.query;
        
        const where = {};
        if (role) where.RoleID = role;
        if (status === 'active') where.IsActive = true;
        if (status === 'inactive') where.IsActive = false;
        // search will be added if needed

        const users = await UserAccount.findAll({
            where,
            include: [{
                model: Role,
                attributes: ['RoleName']
            }, {
                model: GiangVien,
                attributes: ['MaGV']
            }, {
                model: SinhVien,
                attributes: ['MaSV']
            }]
        });

        const formattedUsers = users.map(user => ({
            id: user.UserID,
            username: user.Username,
            role: user.Role ? user.Role.RoleName : 'N/A',
            roleId: user.RoleID,
            refId: user.GiangVien ? user.GiangVien.MaGV : (user.SinhVien ? user.SinhVien.MaSV : '-'),
            status: user.IsActive
        }));

        res.status(200).json({
            status: 'success',
            data: formattedUsers
        });
    } catch (error) {
        next(error);
    }
};

exports.createAccount = async (req, res, next) => {
    try {
        const { username, password, roleId, refType, refId, isActive } = req.body;

        const existing = await UserAccount.findOne({ where: { Username: username } });
        if (existing) {
            return next(new AppError(400, 'Tên đăng nhập đã tồn tại'));
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await UserAccount.create({
            Username: username,
            PasswordHash: hashedPassword,
            RoleID: roleId,
            IsActive: isActive
        });

        if (refType === 'Giảng Viên' && refId) {
            await GiangVien.update({ UserID: newUser.UserID }, { where: { MaGV: refId } });
        } else if (refType === 'Sinh Viên' && refId) {
            await SinhVien.update({ UserID: newUser.UserID }, { where: { MaSV: refId } });
        }

        res.status(201).json({
            status: 'success',
            data: newUser
        });
    } catch (error) {
        next(error);
    }
};

exports.updateAccount = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { roleId, isActive, password } = req.body;

        const user = await UserAccount.findByPk(id);
        if (!user) return next(new AppError(404, 'Không tìm thấy tài khoản'));

        const updates = { RoleID: roleId, IsActive: isActive };
        if (password) {
            updates.PasswordHash = await bcrypt.hash(password, 12);
        }

        await user.update(updates);

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteAccount = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await UserAccount.findByPk(id);
        if (!user) return next(new AppError(404, 'Không tìm thấy tài khoản'));

        await user.destroy();
        res.status(204).json({ status: 'success' });
    } catch (error) {
        next(error);
    }
};

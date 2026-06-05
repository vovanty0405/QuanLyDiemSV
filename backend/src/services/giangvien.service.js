const { GiangVien, UserAccount, Role, Khoa, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');
const bcrypt = require('bcrypt');

const getAllGiangVien = async (query) => {
    const options = APIFeatures.getSequelizeOptions(query, ['MaGV', 'HoTen', 'Email']);
    options.include = [{ model: Khoa, attributes: ['TenKhoa'] }];
    
    const { count, rows } = await GiangVien.findAndCountAll(options);
    return { total: count, data: rows };
};

const getGiangVienById = async (maGV) => {
    const gv = await GiangVien.findByPk(maGV, {
        include: [{ model: Khoa, attributes: ['TenKhoa'] }]
    });
    if (!gv) throw new AppError(404, 'Không tìm thấy Giảng Viên');
    return gv;
};

const createGiangVien = async (data) => {
    const transaction = await sequelize.transaction();
    try {
        const existingGV = await GiangVien.findByPk(data.MaGV, { transaction });
        if (existingGV) throw new AppError(400, 'Mã Giảng Viên đã tồn tại');

        // Tìm Role GiangVien
        const role = await Role.findOne({ where: { RoleName: 'GiangVien' }, transaction });
        if (!role) throw new AppError(500, 'Lỗi hệ thống: Chưa có Role GiangVien');

        // Mật khẩu mặc định là 123456
        const hashedPassword = await bcrypt.hash('123456', 10);

        // Tạo UserAccount trước (hoặc tái sử dụng nếu đã có)
        let userAccount = await UserAccount.findOne({ where: { Username: data.MaGV }, transaction });
        if (userAccount) {
            await userAccount.update({
                PasswordHash: hashedPassword,
                RoleID: role.RoleID,
                IsActive: true
            }, { transaction });
        } else {
            userAccount = await UserAccount.create({
                Username: data.MaGV,
                PasswordHash: hashedPassword,
                RoleID: role.RoleID,
                IsActive: true
            }, { transaction });
        }

        // Tạo Giảng Viên
        data.UserID = userAccount.UserID;
        const gv = await GiangVien.create(data, { transaction });

        await transaction.commit();
        return gv;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateGiangVien = async (maGV, data) => {
    const gv = await getGiangVienById(maGV);
    await gv.update(data);
    return gv;
};

const deleteGiangVien = async (maGV) => {
    const gv = await getGiangVienById(maGV);
    if (gv.UserID) {
        await UserAccount.update({ IsActive: false }, { where: { UserID: gv.UserID } });
    }
    await gv.destroy();
    return true;
};

const getProfile = async (userID) => {
    const gv = await GiangVien.findOne({ where: { UserID: userID }, include: [Khoa] });
    if (!gv) throw new AppError(404, 'Profile không tồn tại');
    return gv;
};

const bulkCreateGiangVien = async (dataArray) => {
    const transaction = await sequelize.transaction();
    try {
        const role = await Role.findOne({ where: { RoleName: 'GiangVien' }, transaction });
        if (!role) throw new AppError(500, 'Lỗi hệ thống: Chưa có Role GiangVien');

        const hashedPassword = await bcrypt.hash('123456', 10);

        for (const data of dataArray) {
            const existingGV = await GiangVien.findByPk(data.MaGV, { transaction });
            if (existingGV) {
                throw new AppError(400, `Mã Giảng Viên ${data.MaGV} đã tồn tại trong CSDL`);
            }

            let userAccount = await UserAccount.findOne({ where: { Username: data.MaGV }, transaction });
            if (userAccount) {
                await userAccount.update({
                    PasswordHash: hashedPassword,
                    RoleID: role.RoleID,
                    IsActive: true
                }, { transaction });
            } else {
                userAccount = await UserAccount.create({
                    Username: data.MaGV,
                    PasswordHash: hashedPassword,
                    RoleID: role.RoleID,
                    IsActive: true
                }, { transaction });
            }

            data.UserID = userAccount.UserID;
            await GiangVien.create(data, { transaction });
        }
        
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    getAllGiangVien,
    getGiangVienById,
    createGiangVien,
    updateGiangVien,
    deleteGiangVien,
    getProfile,
    bulkCreateGiangVien
};

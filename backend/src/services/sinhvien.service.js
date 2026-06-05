const { SinhVien, UserAccount, Role, LopHanhChinh, Nganh, Khoa, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');
const bcrypt = require('bcrypt');

const getAllSinhVien = async (query) => {
    const options = APIFeatures.getSequelizeOptions(query, ['MaSV', 'HoTen', 'Email']);
    options.include = [{ 
        model: LopHanhChinh, 
        attributes: ['TenLop'],
        include: [{
            model: Nganh,
            attributes: ['TenNganh', 'MaKhoa'],
            include: [{ model: Khoa, attributes: ['TenKhoa', 'MaKhoa'] }]
        }]
    }];
    
    const { count, rows } = await SinhVien.findAndCountAll(options);
    return { total: count, data: rows };
};

const getSinhVienById = async (maSV) => {
    const sv = await SinhVien.findByPk(maSV, {
        include: [{ model: LopHanhChinh, attributes: ['TenLop', 'MaNganh'] }]
    });
    if (!sv) throw new AppError(404, 'Không tìm thấy Sinh Viên');
    return sv;
};

const createSinhVien = async (data) => {
    const transaction = await sequelize.transaction();
    try {
        const existingSV = await SinhVien.findByPk(data.MaSV, { transaction });
        if (existingSV) throw new AppError(400, 'Mã Sinh Viên đã tồn tại');

        // Tìm Role SinhVien
        const role = await Role.findOne({ where: { RoleName: 'SinhVien' }, transaction });
        if (!role) throw new AppError(500, 'Lỗi hệ thống: Chưa có Role SinhVien');

        // Mật khẩu mặc định là 123456
        const hashedPassword = await bcrypt.hash('123456', 10);

        // Tạo UserAccount trước (hoặc tái sử dụng nếu đã có)
        let userAccount = await UserAccount.findOne({ where: { Username: data.MaSV }, transaction });
        if (userAccount) {
            await userAccount.update({
                PasswordHash: hashedPassword,
                RoleID: role.RoleID,
                IsActive: true
            }, { transaction });
        } else {
            userAccount = await UserAccount.create({
                Username: data.MaSV,
                PasswordHash: hashedPassword,
                RoleID: role.RoleID,
                IsActive: true
            }, { transaction });
        }

        // Tạo Sinh Viên
        data.UserID = userAccount.UserID;
        const sv = await SinhVien.create(data, { transaction });

        await transaction.commit();
        return sv;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateSinhVien = async (maSV, data) => {
    const sv = await getSinhVienById(maSV);
    await sv.update(data);
    return sv;
};

const deleteSinhVien = async (maSV) => {
    const sv = await getSinhVienById(maSV);
    // Lưu ý: xóa Sinh Viên có xóa UserAccount kèm theo không tùy vào policy,
    // ở đây ta có thể cập nhật trạng thái IsActive = false cho UserAccount
    if (sv.UserID) {
        await UserAccount.update({ IsActive: false }, { where: { UserID: sv.UserID } });
    }
    await sv.destroy();
    return true;
};

const getProfile = async (userID) => {
    const sv = await SinhVien.findOne({ where: { UserID: userID }, include: [LopHanhChinh] });
    if (!sv) throw new AppError(404, 'Profile không tồn tại');
    return sv;
};

const bulkCreateSinhVien = async (dataArray) => {
    const transaction = await sequelize.transaction();
    try {
        const role = await Role.findOne({ where: { RoleName: 'SinhVien' }, transaction });
        if (!role) throw new AppError(500, 'Lỗi hệ thống: Chưa có Role SinhVien');

        const hashedPassword = await bcrypt.hash('123456', 10);

        for (const data of dataArray) {
            const existingSV = await SinhVien.findByPk(data.MaSV, { transaction });
            if (existingSV) {
                throw new AppError(400, `Mã Sinh Viên ${data.MaSV} đã tồn tại trong CSDL`);
            }

            let userAccount = await UserAccount.findOne({ where: { Username: data.MaSV }, transaction });
            if (userAccount) {
                await userAccount.update({
                    PasswordHash: hashedPassword,
                    RoleID: role.RoleID,
                    IsActive: true
                }, { transaction });
            } else {
                userAccount = await UserAccount.create({
                    Username: data.MaSV,
                    PasswordHash: hashedPassword,
                    RoleID: role.RoleID,
                    IsActive: true
                }, { transaction });
            }

            data.UserID = userAccount.UserID;
            await SinhVien.create(data, { transaction });
        }
        
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    getAllSinhVien,
    getSinhVienById,
    createSinhVien,
    updateSinhVien,
    deleteSinhVien,
    getProfile,
    bulkCreateSinhVien
};

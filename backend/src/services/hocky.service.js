const { HocKy } = require('../models');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

const getAllHocKy = async (query) => {
    const options = APIFeatures.getSequelizeOptions(query, ['MaHK', 'TenHK']);
    const { count, rows } = await HocKy.findAndCountAll(options);
    return { total: count, data: rows };
};

const getHocKyById = async (maHK) => {
    const hk = await HocKy.findByPk(maHK);
    if (!hk) throw new AppError(404, 'Không tìm thấy Học Kỳ');
    return hk;
};

const createHocKy = async (data) => {
    const existing = await HocKy.findByPk(data.MaHK);
    if (existing) throw new AppError(400, 'Mã Học Kỳ đã tồn tại');
    
    if (data.NamHocBatDau > data.NamHocKetThuc) {
        throw new AppError(400, 'Năm học bắt đầu không thể lớn hơn năm học kết thúc');
    }

    const hk = await HocKy.create(data);
    return hk;
};

const updateHocKy = async (maHK, data) => {
    const hk = await getHocKyById(maHK);
    
    if (data.NamHocBatDau && data.NamHocKetThuc && data.NamHocBatDau > data.NamHocKetThuc) {
        throw new AppError(400, 'Năm học bắt đầu không thể lớn hơn năm học kết thúc');
    }

    await hk.update(data);
    return hk;
};

const deleteHocKy = async (maHK) => {
    const hk = await getHocKyById(maHK);
    await hk.destroy();
    return true;
};

module.exports = {
    getAllHocKy,
    getHocKyById,
    createHocKy,
    updateHocKy,
    deleteHocKy
};

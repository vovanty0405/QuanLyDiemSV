const { Khoa, Nganh } = require('../models');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

const getAllKhoa = async (query) => {
    const options = APIFeatures.getSequelizeOptions(query, ['MaKhoa', 'TenKhoa']);
    
    // Nếu query param có includeNganh=true
    if (query.includeNganh === 'true') {
        options.include = [{ model: Nganh }];
    }

    const { count, rows } = await Khoa.findAndCountAll(options);
    return { total: count, data: rows };
};

const getKhoaById = async (maKhoa) => {
    const khoa = await Khoa.findByPk(maKhoa, {
        include: [{ model: Nganh }]
    });
    if (!khoa) throw new AppError(404, 'Không tìm thấy Khoa');
    return khoa;
};

const createKhoa = async (data) => {
    const existing = await Khoa.findByPk(data.MaKhoa);
    if (existing) throw new AppError(400, 'Mã Khoa đã tồn tại');

    const khoa = await Khoa.create(data);
    return khoa;
};

const updateKhoa = async (maKhoa, data) => {
    const khoa = await getKhoaById(maKhoa);
    await khoa.update(data);
    return khoa;
};

const deleteKhoa = async (maKhoa) => {
    const khoa = await getKhoaById(maKhoa);
    await khoa.destroy();
    return true;
};

module.exports = {
    getAllKhoa,
    getKhoaById,
    createKhoa,
    updateKhoa,
    deleteKhoa
};

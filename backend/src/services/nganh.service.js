const { Nganh, Khoa } = require('../models');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

const getAllNganh = async (query) => {
    const options = APIFeatures.getSequelizeOptions(query, ['MaNganh', 'TenNganh']);
    options.include = [{ model: Khoa, attributes: ['TenKhoa'] }];
    
    const { count, rows } = await Nganh.findAndCountAll(options);
    return { total: count, data: rows };
};

const getNganhById = async (maNganh) => {
    const nganh = await Nganh.findByPk(maNganh, {
        include: [{ model: Khoa, attributes: ['TenKhoa'] }]
    });
    if (!nganh) throw new AppError(404, 'Không tìm thấy Ngành');
    return nganh;
};

const createNganh = async (data) => {
    const existing = await Nganh.findByPk(data.MaNganh);
    if (existing) throw new AppError(400, 'Mã Ngành đã tồn tại');

    const khoa = await Khoa.findByPk(data.MaKhoa);
    if (!khoa) throw new AppError(404, 'Mã Khoa không tồn tại');

    const nganh = await Nganh.create(data);
    return nganh;
};

const updateNganh = async (maNganh, data) => {
    const nganh = await getNganhById(maNganh);
    
    if (data.MaKhoa) {
        const khoa = await Khoa.findByPk(data.MaKhoa);
        if (!khoa) throw new AppError(404, 'Mã Khoa không tồn tại');
    }

    await nganh.update(data);
    return nganh;
};

const deleteNganh = async (maNganh) => {
    const nganh = await getNganhById(maNganh);
    await nganh.destroy();
    return true;
};

module.exports = {
    getAllNganh,
    getNganhById,
    createNganh,
    updateNganh,
    deleteNganh
};

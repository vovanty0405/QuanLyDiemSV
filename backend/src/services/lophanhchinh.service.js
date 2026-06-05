const { LopHanhChinh, Nganh, GiangVien, Khoa, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

const getAllLopHanhChinh = async (query) => {
    const options = APIFeatures.getSequelizeOptions(query, ['MaLop', 'TenLop']);
    options.include = [
        { 
            model: Nganh, 
            attributes: ['TenNganh', 'MaKhoa'],
            include: [{ model: Khoa, attributes: ['TenKhoa', 'MaKhoa'] }] 
        },
        { model: GiangVien, attributes: ['HoTen'] }
    ];

    const { count, rows } = await LopHanhChinh.findAndCountAll(options);
    return { total: count, data: rows };
};

const getLopHanhChinhById = async (maLop) => {
    const lop = await LopHanhChinh.findByPk(maLop, {
        include: [
            { model: Nganh, attributes: ['TenNganh', 'MaKhoa'] },
            { model: GiangVien, attributes: ['HoTen', 'Email'] }
        ]
    });
    if (!lop) throw new AppError(404, 'Không tìm thấy Lớp Hành Chính');
    return lop;
};

const createLopHanhChinh = async (data) => {
    const existing = await LopHanhChinh.findByPk(data.MaLop);
    if (existing) throw new AppError(400, 'Mã Lớp Hành Chính đã tồn tại');

    if (data.MaNganh) {
        const nganh = await Nganh.findByPk(data.MaNganh);
        if (!nganh) throw new AppError(400, 'Mã Ngành không tồn tại');
    }

    if (data.MaGVCN) {
        const gv = await GiangVien.findByPk(data.MaGVCN);
        if (!gv) throw new AppError(400, 'Mã Giảng Viên không tồn tại');
    }

    const lop = await LopHanhChinh.create(data);
    return lop;
};

const updateLopHanhChinh = async (maLop, data) => {
    const lop = await LopHanhChinh.findByPk(maLop);
    if (!lop) throw new AppError(404, 'Không tìm thấy Lớp Hành Chính');

    if (data.MaNganh) {
        const nganh = await Nganh.findByPk(data.MaNganh);
        if (!nganh) throw new AppError(400, 'Mã Ngành không tồn tại');
    }

    if (data.MaGVCN) {
        const gv = await GiangVien.findByPk(data.MaGVCN);
        if (!gv) throw new AppError(400, 'Mã Giảng Viên không tồn tại');
    }

    await lop.update(data);
    return lop;
};

const deleteLopHanhChinh = async (maLop) => {
    const lop = await LopHanhChinh.findByPk(maLop);
    if (!lop) throw new AppError(404, 'Không tìm thấy Lớp Hành Chính');
    await lop.destroy();
    return true;
};

const bulkCreateLopHanhChinh = async (dataArray) => {
    const transaction = await sequelize.transaction();
    try {
        let errors = [];
        for (const [index, data] of dataArray.entries()) {
            if (!data.MaLop) {
                errors.push(`Dòng ${index + 1}: Thiếu Mã Lớp.`);
                continue;
            }
            const existing = await LopHanhChinh.findByPk(data.MaLop, { transaction });
            if (existing) {
                errors.push(`Dòng ${index + 1}: Mã lớp '${data.MaLop}' đã tồn tại.`);
                continue;
            }
            if (data.MaNganh) {
                const nganh = await Nganh.findByPk(data.MaNganh, { transaction });
                if (!nganh) {
                    errors.push(`Dòng ${index + 1}: Mã ngành '${data.MaNganh}' không tồn tại.`);
                    continue;
                }
            }
            if (data.MaGVCN) {
                const gv = await GiangVien.findByPk(data.MaGVCN, { transaction });
                if (!gv) {
                    errors.push(`Dòng ${index + 1}: Mã giảng viên '${data.MaGVCN}' không tồn tại.`);
                    continue;
                }
            }
        }
        
        if (errors.length > 0) {
            throw new AppError(400, errors.join('\n'));
        }

        await LopHanhChinh.bulkCreate(dataArray, { transaction });
        
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    getAllLopHanhChinh,
    getLopHanhChinhById,
    createLopHanhChinh,
    updateLopHanhChinh,
    deleteLopHanhChinh,
    bulkCreateLopHanhChinh
};

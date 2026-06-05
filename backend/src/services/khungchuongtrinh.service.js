const { QuyDinhTotNghiep, KhungChuongTrinh, MonHoc, Nganh, sequelize } = require('../models');
const AppError = require('../utils/AppError');

const getKhungDaoTaoByNganh = async (maNganh) => {
    // 1. Get Nganh & QuyDinh
    const nganh = await Nganh.findByPk(maNganh, {
        include: [{ model: QuyDinhTotNghiep }]
    });

    if (!nganh) {
        throw new AppError(404, 'Không tìm thấy Ngành');
    }

    // 2. Get MonHoc trong Khung
    const chiTietKhung = await KhungChuongTrinh.findAll({
        where: { MaNganh: maNganh },
        include: [{ model: MonHoc }],
        order: [['HocKyDuKien', 'ASC']]
    });

    return {
        Nganh: nganh,
        ChiTietKhung: chiTietKhung
    };
};

const updateQuyDinhTotNghiep = async (maNganh, data) => {
    const nganh = await Nganh.findByPk(maNganh);
    if (!nganh) throw new AppError(404, 'Không tìm thấy Ngành');

    let quyDinh = await QuyDinhTotNghiep.findByPk(maNganh);
    if (quyDinh) {
        await quyDinh.update(data);
    } else {
        quyDinh = await QuyDinhTotNghiep.create({ ...data, MaNganh: maNganh });
    }
    return quyDinh;
};

const addMonToKhung = async (maNganh, dataArray) => {
    // dataArray = [{ MaMon, HocKyDuKien, LoaiMon }]
    const transaction = await sequelize.transaction();
    try {
        const results = [];
        for (const data of dataArray) {
            // Check existing
            const existing = await KhungChuongTrinh.findOne({
                where: { MaNganh: maNganh, MaMon: data.MaMon },
                transaction
            });
            if (existing) {
                // Update
                const updated = await existing.update({
                    HocKyDuKien: data.HocKyDuKien,
                    LoaiMon: data.LoaiMon
                }, { transaction });
                results.push(updated);
            } else {
                // Create
                const created = await KhungChuongTrinh.create({
                    MaNganh: maNganh,
                    MaMon: data.MaMon,
                    HocKyDuKien: data.HocKyDuKien,
                    LoaiMon: data.LoaiMon
                }, { transaction });
                results.push(created);
            }
        }
        await transaction.commit();
        return results;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const removeMonFromKhung = async (maNganh, maMon) => {
    const deletedCount = await KhungChuongTrinh.destroy({
        where: { MaNganh: maNganh, MaMon: maMon }
    });
    if (deletedCount === 0) {
        throw new AppError(404, 'Không tìm thấy môn học trong khung chương trình của ngành này');
    }
    return true;
};

module.exports = {
    getKhungDaoTaoByNganh,
    updateQuyDinhTotNghiep,
    addMonToKhung,
    removeMonFromKhung
};

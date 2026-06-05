const { MonHoc, Khoa, DieuKienMonHoc, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

const getAllMonHoc = async (query) => {
    const options = APIFeatures.getSequelizeOptions(query, ['MaMon', 'TenMon']);
    options.include = [
        { model: Khoa, attributes: ['TenKhoa'] },
        { 
            model: DieuKienMonHoc, 
            as: 'MonHocChinh',
            include: [{ model: MonHoc, as: 'MonHocTienQuyet', attributes: ['TenMon'] }]
        }
    ];
    
    const { count, rows } = await MonHoc.findAndCountAll(options);
    return { total: count, data: rows };
};

const checkCircularDependency = async (maMon, monTienQuyetIds, transaction) => {
    if (!monTienQuyetIds || monTienQuyetIds.length === 0) return;
    
    const queue = [...monTienQuyetIds];
    const visited = new Set();
    
    while (queue.length > 0) {
        const currentPrereq = queue.shift();
        
        if (currentPrereq === maMon) {
            throw new AppError(400, `Phát hiện vòng lặp môn tiên quyết (Circular Dependency) liên quan đến môn ${maMon}.`);
        }
        
        if (!visited.has(currentPrereq)) {
            visited.add(currentPrereq);
            const prereqs = await DieuKienMonHoc.findAll({
                where: { MaMon: currentPrereq },
                transaction
            });
            for (const p of prereqs) {
                queue.push(p.MaMonTienQuyet);
            }
        }
    }
};

const getMonHocById = async (maMon) => {
    const monHoc = await MonHoc.findByPk(maMon, {
        include: [
            { model: Khoa, attributes: ['TenKhoa'] },
            { 
                model: DieuKienMonHoc, 
                as: 'MonHocChinh', // Môn chính là môn hiện tại, tiên quyết là môn khác
                include: [{ model: MonHoc, as: 'MonHocTienQuyet', attributes: ['TenMon'] }]
            }
        ]
    });
    if (!monHoc) throw new AppError(404, 'Không tìm thấy Môn Học');
    return monHoc;
};

const createMonHoc = async (data) => {
    const transaction = await sequelize.transaction();
    try {
        const existing = await MonHoc.findByPk(data.MaMon, { transaction });
        if (existing) throw new AppError(400, 'Mã Môn Học đã tồn tại');

        if (data.MaKhoa) {
            const khoa = await Khoa.findByPk(data.MaKhoa, { transaction });
            if (!khoa) throw new AppError(404, 'Mã Khoa không tồn tại');
        }

        // Tạo môn học
        const monHoc = await MonHoc.create(data, { transaction });

        // Tạo môn tiên quyết nếu có
        if (data.MonTienQuyetIds && data.MonTienQuyetIds.length > 0) {
            await checkCircularDependency(data.MaMon, data.MonTienQuyetIds, transaction);
            const arrDieuKien = data.MonTienQuyetIds.map(maTienQuyet => ({
                MaMon: data.MaMon,
                MaMonTienQuyet: maTienQuyet
            }));
            await DieuKienMonHoc.bulkCreate(arrDieuKien, { transaction });
        }

        await transaction.commit();
        return monHoc;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateMonHoc = async (maMon, data) => {
    const transaction = await sequelize.transaction();
    try {
        const monHoc = await MonHoc.findByPk(maMon, { transaction });
        if (!monHoc) throw new AppError(404, 'Không tìm thấy Môn Học');
        
        if (data.MaKhoa) {
            const khoa = await Khoa.findByPk(data.MaKhoa, { transaction });
            if (!khoa) throw new AppError(404, 'Mã Khoa không tồn tại');
        }

        await monHoc.update(data, { transaction });

        // Cập nhật môn tiên quyết nếu client truyền vào
        if (data.MonTienQuyetIds !== undefined) {
            // Xóa cũ
            await DieuKienMonHoc.destroy({ where: { MaMon: maMon }, transaction });
            
            // Thêm mới
            if (data.MonTienQuyetIds.length > 0) {
                await checkCircularDependency(maMon, data.MonTienQuyetIds, transaction);
                const arrDieuKien = data.MonTienQuyetIds.map(maTienQuyet => ({
                    MaMon: maMon,
                    MaMonTienQuyet: maTienQuyet
                }));
                await DieuKienMonHoc.bulkCreate(arrDieuKien, { transaction });
            }
        }

        await transaction.commit();
        return monHoc;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const deleteMonHoc = async (maMon) => {
    const monHoc = await MonHoc.findByPk(maMon);
    if (!monHoc) throw new AppError(404, 'Không tìm thấy Môn Học');
    await monHoc.destroy();
    return true;
};

const bulkCreateMonHoc = async (dataArray) => {
    const transaction = await sequelize.transaction();
    try {
        const monHocsToCreate = [];
        const prereqsToCreate = [];
        
        // Phase 1: Prepare and insert all courses first
        for (const data of dataArray) {
            if (!data.MaMon || !data.TenMon) continue;
            
            monHocsToCreate.push({
                MaMon: data.MaMon,
                TenMon: data.TenMon,
                SoTinChi: data.SoTinChi || 3,
                SoTietLyThuyet: data.SoTietLyThuyet || 0,
                SoTietThucHanh: data.SoTietThucHanh || 0,
                MaKhoa: data.MaKhoa || null
            });
            
            if (data.MonTienQuyetIds && data.MonTienQuyetIds.length > 0) {
                prereqsToCreate.push({
                    maMon: data.MaMon,
                    prereqs: data.MonTienQuyetIds
                });
            }
        }
        
        // Use ignoreDuplicates or similar? upsert is better but bulkCreate with updateOnDuplicate works
        await MonHoc.bulkCreate(monHocsToCreate, { 
            transaction,
            updateOnDuplicate: ['TenMon', 'SoTinChi', 'SoTietLyThuyet', 'SoTietThucHanh', 'MaKhoa']
        });

        // Phase 2: Add prerequisites with circular dependency checks
        for (const item of prereqsToCreate) {
            // Check circular dependency using the state inside transaction
            await checkCircularDependency(item.maMon, item.prereqs, transaction);
            
            const arrDieuKien = item.prereqs.map(maTienQuyet => ({
                MaMon: item.maMon,
                MaMonTienQuyet: maTienQuyet
            }));
            
            // Delete old prereqs if updating
            await DieuKienMonHoc.destroy({ where: { MaMon: item.maMon }, transaction });
            // Insert new ones
            await DieuKienMonHoc.bulkCreate(arrDieuKien, { transaction });
        }

        await transaction.commit();
        return { message: `Đã nhập thành công ${monHocsToCreate.length} môn học.` };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    getAllMonHoc,
    getMonHocById,
    createMonHoc,
    updateMonHoc,
    deleteMonHoc,
    bulkCreateMonHoc
};

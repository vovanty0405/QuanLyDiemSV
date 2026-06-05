const { LopHocPhan, MonHoc, HocKy, GiangVien, SinhVien, KetQuaHocTap, DieuKienMonHoc, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');
const { Op } = require('sequelize');

// ============================================
// CRUD Lớp Học Phần
// ============================================

const getAllLopHocPhan = async (query) => {
    const options = APIFeatures.getSequelizeOptions(query, ['MaLHP', 'TenLopHP']);
    options.include = [
        { model: MonHoc, attributes: ['TenMon', 'SoTinChi', 'MaKhoa'] },
        { model: HocKy, attributes: ['TenHK'] },
        { model: GiangVien, attributes: ['HoTen'] },
        { model: KetQuaHocTap, attributes: ['MaSV'] }
    ];

    const { count, rows } = await LopHocPhan.findAndCountAll(options);
    return { total: count, data: rows };
};

const getLopHocPhanById = async (maLHP) => {
    const lhp = await LopHocPhan.findByPk(maLHP, {
        include: [
            { model: MonHoc, attributes: ['TenMon', 'SoTinChi', 'MaKhoa'] },
            { model: HocKy, attributes: ['TenHK', 'NamHocBatDau'] },
            { model: GiangVien, attributes: ['HoTen', 'Email'] },
            {
                model: KetQuaHocTap,
                include: [{ model: SinhVien, attributes: ['MaSV', 'HoTen'] }]
            }
        ]
    });
    if (!lhp) throw new AppError(404, 'Không tìm thấy Lớp Học Phần');
    return lhp;
};

const createLopHocPhan = async (data) => {
    // Kiểm tra MaMon tồn tại
    const monHoc = await MonHoc.findByPk(data.MaMon);
    if (!monHoc) throw new AppError(400, 'Mã Môn Học không tồn tại');

    // Kiểm tra MaHK tồn tại
    const hocKy = await HocKy.findByPk(data.MaHK);
    if (!hocKy) throw new AppError(400, 'Mã Học Kỳ không tồn tại');

    // Kiểm tra MaLHP chưa tồn tại
    const existing = await LopHocPhan.findByPk(data.MaLHP);
    if (existing) throw new AppError(400, 'Mã Lớp Học Phần đã tồn tại');

    // Kiểm tra GV nếu có
    if (data.MaGV) {
        const gv = await GiangVien.findByPk(data.MaGV);
        if (!gv) throw new AppError(400, 'Mã Giảng Viên không tồn tại');
    }

    // Đặt trạng thái mặc định
    if (!data.TrangThai) {
        data.TrangThai = 'MoDangKy';
    }

    const lhp = await LopHocPhan.create(data);
    return lhp;
};

const updateLopHocPhan = async (maLHP, data) => {
    const lhp = await LopHocPhan.findByPk(maLHP);
    if (!lhp) throw new AppError(404, 'Không tìm thấy Lớp Học Phần');

    // Kiểm tra GV nếu cập nhật
    if (data.MaGV) {
        const gv = await GiangVien.findByPk(data.MaGV);
        if (!gv) throw new AppError(400, 'Mã Giảng Viên không tồn tại');
    }

    await lhp.update(data);
    return lhp;
};

const deleteLopHocPhan = async (maLHP) => {
    const lhp = await LopHocPhan.findByPk(maLHP);
    if (!lhp) throw new AppError(404, 'Không tìm thấy Lớp Học Phần');

    // Kiểm tra đã có SV đăng ký chưa
    const soSV = await KetQuaHocTap.count({ where: { MaLHP: maLHP } });
    if (soSV > 0) {
        throw new AppError(400, `Không thể xoá Lớp Học Phần đã có ${soSV} sinh viên đăng ký`);
    }

    await lhp.destroy();
    return true;
};

// ============================================
// Xếp Lớp (Đăng ký Học Phần)
// ============================================

const dangKyHocPhan = async (maLHP, maSV) => {
    const transaction = await sequelize.transaction();
    try {
        // 1. Kiểm tra LHP tồn tại và đang mở đăng ký
        const lhp = await LopHocPhan.findByPk(maLHP, {
            include: [{ model: MonHoc }],
            transaction
        });
        if (!lhp) throw new AppError(404, 'Không tìm thấy Lớp Học Phần');
        if (lhp.TrangThai !== 'MoDangKy') {
            throw new AppError(400, `Lớp Học Phần hiện đang ở trạng thái "${lhp.TrangThai}", không thể đăng ký`);
        }

        // 2. Kiểm tra SV tồn tại
        const sv = await SinhVien.findByPk(maSV, { transaction });
        if (!sv) throw new AppError(404, 'Không tìm thấy Sinh Viên');

        // 3. Kiểm tra SV đã đăng ký LHP này chưa
        const daCoKQ = await KetQuaHocTap.findOne({
            where: { MaSV: maSV, MaLHP: maLHP },
            transaction
        });
        if (daCoKQ) throw new AppError(400, 'Sinh viên đã đăng ký Lớp Học Phần này rồi');

        // 4. Kiểm tra sĩ số tối đa
        const siSoHienTai = await KetQuaHocTap.count({
            where: { MaLHP: maLHP },
            transaction
        });
        if (siSoHienTai >= lhp.SiSoToiDa) {
            throw new AppError(400, `Lớp Học Phần đã đầy (${siSoHienTai}/${lhp.SiSoToiDa})`);
        }

        // 5. Kiểm tra môn tiên quyết
        const dkMonHoc = await DieuKienMonHoc.findAll({
            where: { MaMon: lhp.MaMon },
            transaction
        });

        if (dkMonHoc.length > 0) {
            const dsMonTienQuyet = dkMonHoc.map(dk => dk.MaMonTienQuyet);

            // Lấy danh sách các LHP thuộc các môn tiên quyết mà SV đã đạt (DiemTongKet >= 4.0)
            const ketQuaDat = await KetQuaHocTap.findAll({
                where: {
                    MaSV: maSV,
                    DiemTongKet: { [Op.gte]: 4.0 }
                },
                include: [{
                    model: LopHocPhan,
                    attributes: ['MaMon'],
                    where: { MaMon: { [Op.in]: dsMonTienQuyet } }
                }],
                transaction
            });

            // Lấy danh sách các MaMon đã đạt
            const dsMonDaDat = [...new Set(ketQuaDat.map(kq => kq.LopHocPhan.MaMon))];

            // Kiểm tra xem có thiếu môn tiên quyết nào không
            const dsMonChuaDat = dsMonTienQuyet.filter(mon => !dsMonDaDat.includes(mon));

            if (dsMonChuaDat.length > 0) {
                // Lấy tên các môn chưa đạt để thông báo rõ ràng
                const tenMonChuaDat = await MonHoc.findAll({
                    where: { MaMon: { [Op.in]: dsMonChuaDat } },
                    attributes: ['MaMon', 'TenMon'],
                    transaction
                });
                const dsTen = tenMonChuaDat.map(m => `${m.MaMon} - ${m.TenMon}`).join(', ');
                throw new AppError(400, `Sinh viên chưa đạt các môn tiên quyết: ${dsTen}`);
            }
        }

        // 6. Tạo bản ghi KetQuaHocTap (điểm để null, chờ GV nhập sau)
        const ketQua = await KetQuaHocTap.create({
            MaSV: maSV,
            MaLHP: maLHP
        }, { transaction });

        await transaction.commit();
        return ketQua;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const huyDangKy = async (maLHP, maSV) => {
    const ketQua = await KetQuaHocTap.findOne({
        where: { MaSV: maSV, MaLHP: maLHP }
    });
    if (!ketQua) throw new AppError(404, 'Không tìm thấy đăng ký của Sinh viên trong Lớp Học Phần này');

    // Kiểm tra nếu đã có điểm rồi thì không cho huỷ
    if (ketQua.DiemCC !== null || ketQua.DiemGK !== null || ketQua.DiemCK !== null) {
        throw new AppError(400, 'Không thể huỷ đăng ký vì Sinh viên đã có điểm trong lớp này');
    }

    await ketQua.destroy();
    return true;
};

// ============================================
// Lấy danh sách LHP của Giảng viên
// ============================================

const dangKyHocPhanHangLoat = async (maLHP, danhSachMaSV) => {
    const transaction = await sequelize.transaction();
    try {
        // 1. Kiểm tra LHP tồn tại và trạng thái
        const lhp = await LopHocPhan.findByPk(maLHP, {
            include: [{ model: MonHoc }],
            transaction
        });
        if (!lhp) throw new AppError(404, 'Không tìm thấy Lớp Học Phần');
        if (lhp.TrangThai !== 'MoDangKy' && lhp.TrangThai !== 'Đang mở') {
            throw new AppError(400, `Lớp Học Phần hiện đang ở trạng thái "${lhp.TrangThai}", không thể xếp lớp`);
        }

        // 2. Lấy danh sách đăng ký hiện tại
        const currentEnrollments = await KetQuaHocTap.findAll({
            where: { MaLHP: maLHP },
            transaction
        });

        const currentMaSVSet = new Set(currentEnrollments.map(kq => kq.MaSV));
        const newMaSVSet = new Set(danhSachMaSV);

        // 3. Xoá những SV không còn trong danh sách (nhưng chưa có điểm)
        const svToRemove = currentEnrollments.filter(kq => !newMaSVSet.has(kq.MaSV));
        for (const kq of svToRemove) {
            if (kq.DiemCC !== null || kq.DiemGK !== null || kq.DiemCK !== null) {
                throw new AppError(400, `Không thể loại Sinh viên ${kq.MaSV} vì đã có điểm trong hệ thống`);
            }
            await kq.destroy({ transaction });
        }

        // 4. Kiểm tra sĩ số khi thêm mới
        const svToAdd = danhSachMaSV.filter(maSV => !currentMaSVSet.has(maSV));
        const finalCount = currentEnrollments.length - svToRemove.length + svToAdd.length;
        if (finalCount > lhp.SiSoToiDa) {
            throw new AppError(400, `Sĩ số vượt quá giới hạn (${finalCount}/${lhp.SiSoToiDa}). Vui lòng giảm số lượng.`);
        }

        // 5. Kiểm tra môn tiên quyết cho những SV được thêm mới
        const dkMonHoc = await DieuKienMonHoc.findAll({
            where: { MaMon: lhp.MaMon },
            transaction
        });

        let errors = [];

        for (const maSV of svToAdd) {
            // Kiểm tra SV tồn tại
            const sv = await SinhVien.findByPk(maSV, { transaction });
            if (!sv) {
                errors.push(`Sinh viên ${maSV} không tồn tại`);
                continue;
            }

            if (dkMonHoc.length > 0) {
                const dsMonTienQuyet = dkMonHoc.map(dk => dk.MaMonTienQuyet);
                const ketQuaDat = await KetQuaHocTap.findAll({
                    where: { MaSV: maSV, DiemTongKet: { [Op.gte]: 4.0 } },
                    include: [{
                        model: LopHocPhan,
                        attributes: ['MaMon'],
                        where: { MaMon: { [Op.in]: dsMonTienQuyet } }
                    }],
                    transaction
                });

                const dsMonDaDat = [...new Set(ketQuaDat.map(kq => kq.LopHocPhan.MaMon))];
                const dsMonChuaDat = dsMonTienQuyet.filter(mon => !dsMonDaDat.includes(mon));

                if (dsMonChuaDat.length > 0) {
                    const tenMonChuaDat = await MonHoc.findAll({
                        where: { MaMon: { [Op.in]: dsMonChuaDat } },
                        attributes: ['MaMon', 'TenMon'],
                        transaction
                    });
                    const dsTen = tenMonChuaDat.map(m => `${m.MaMon} - ${m.TenMon}`).join(', ');
                    errors.push(`${sv.HoTen} (${maSV}) chưa đạt: ${dsTen}`);
                }
            }
        }

        // Nếu có lỗi tiên quyết -> rollback và báo cho user
        if (errors.length > 0) {
            throw new AppError(400, "Xếp lớp thất bại do có sinh viên vướng môn tiên quyết:\n" + errors.join('\n'));
        }

        // 6. Thêm SV mới vào KetQuaHocTap
        for (const maSV of svToAdd) {
            await KetQuaHocTap.create({ MaSV: maSV, MaLHP: maLHP }, { transaction });
        }

        await transaction.commit();
        return { success: true, message: `Đã cập nhật danh sách lớp (${finalCount} sinh viên)` };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getLopHocPhanByGiangVien = async (maGV, query) => {
    const options = APIFeatures.getSequelizeOptions(query, ['MaLHP', 'TenLopHP']);
    options.where.MaGV = maGV;
    options.include = [
        { model: MonHoc, attributes: ['TenMon', 'SoTinChi'] },
        { model: HocKy, attributes: ['TenHK', 'NamHocBatDau', 'NamHocKetThuc'] }
    ];

    const { count, rows } = await LopHocPhan.findAndCountAll(options);
    return { total: count, data: rows };
};

const bulkCreateLopHocPhan = async (dataArray) => {
    const transaction = await sequelize.transaction();
    try {
        for (const data of dataArray) {
            const existingLHP = await LopHocPhan.findByPk(data.MaLHP, { transaction });
            if (existingLHP) {
                throw new AppError(400, `Mã Lớp Học Phần ${data.MaLHP} đã tồn tại trong CSDL`);
            }

            if (!data.TrangThai) {
                data.TrangThai = 'MoDangKy';
            }

            await LopHocPhan.create(data, { transaction });
        }
        
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const configGrades = async (maLHP, maGV, data) => {
    const lhp = await LopHocPhan.findByPk(maLHP);
    if (!lhp) throw new AppError(404, 'Không tìm thấy Lớp Học Phần');

    if (lhp.MaGV !== maGV) {
        throw new AppError(403, 'Bạn không có quyền cấu hình điểm cho lớp học phần này');
    }

    const trongSoQT = parseFloat(data.trongSoQT);
    const trongSoCK = parseFloat(data.trongSoCK);

    if (isNaN(trongSoQT) || isNaN(trongSoCK) || trongSoQT + trongSoCK !== 100) {
        throw new AppError(400, 'Tổng trọng số Quá trình và Cuối kỳ phải bằng 100%');
    }

    let totalCotDiem = 0;
    if (data.cotDiemQT && Array.isArray(data.cotDiemQT)) {
        for (const cot of data.cotDiemQT) {
            totalCotDiem += parseFloat(cot.weight || 0);
        }
        if (data.cotDiemQT.length > 0 && Math.abs(totalCotDiem - 100) > 0.01) {
            throw new AppError(400, 'Tổng trọng số các cột điểm quá trình phải bằng 100%');
        }
    }

    lhp.CauHinhDiem = JSON.stringify({
        trongSoQT,
        trongSoCK,
        cotDiemQT: data.cotDiemQT || []
    });

    await lhp.save();
    return lhp;
};

module.exports = {
    getAllLopHocPhan,
    getLopHocPhanById,
    createLopHocPhan,
    updateLopHocPhan,
    deleteLopHocPhan,
    dangKyHocPhan,
    huyDangKy,
    dangKyHocPhanHangLoat,
    getLopHocPhanByGiangVien,
    bulkCreateLopHocPhan,
    configGrades
};

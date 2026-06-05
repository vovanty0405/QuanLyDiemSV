const { KetQuaHocTap, LopHocPhan, SinhVien, MonHoc, HocKy, GiangVien, Role, UserAccount, NhatKyHoatDong, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

// ============================================
// Hàm bổ trợ: Xác thực mật khẩu trước khi lưu điểm
// ============================================

/**
 * Xác thực mật khẩu người dùng hiện tại
 * Dùng để bảo vệ thao tác nhập điểm — chỉ lưu vào CSDL khi mật khẩu đúng
 */
const xacThucMatKhau = async (userID, password) => {
    const user = await UserAccount.findByPk(userID);
    if (!user) throw new AppError(401, 'Không tìm thấy tài khoản người dùng');

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
        throw new AppError(401, 'Mật khẩu xác nhận không đúng. Điểm chưa được lưu!');
    }
    return true;
};

// ============================================
// Hàm bổ trợ: Tính điểm & Quy đổi
// ============================================

/**
 * Tính Điểm Tổng Kết theo công thức: CC*0.1 + GK*0.3 + CK*0.6
 * Chỉ tính khi đủ cả 3 cột điểm
 */
const tinhDiemTongKet = (diemGK, diemCK, cauHinhDiemJSON) => {
    if (diemGK === null || diemGK === undefined ||
        diemCK === null || diemCK === undefined) {
        return null;
    }
    let trongSoQT = 50;
    let trongSoCK = 50;
    if (cauHinhDiemJSON) {
        try {
            const config = JSON.parse(cauHinhDiemJSON);
            if (config.trongSoQT !== undefined) trongSoQT = parseFloat(config.trongSoQT);
            if (config.trongSoCK !== undefined) trongSoCK = parseFloat(config.trongSoCK);
        } catch(e){}
    }
    const tongKet = diemGK * (trongSoQT / 100) + diemCK * (trongSoCK / 100);
    return Math.round(tongKet * 100) / 100;
};

const tinhDiemGKTuChiTiet = (chiTietDiemQTJSON, cauHinhDiemJSON) => {
    if (!chiTietDiemQTJSON || !cauHinhDiemJSON) return null;
    try {
        const chiTiet = typeof chiTietDiemQTJSON === 'string' ? JSON.parse(chiTietDiemQTJSON) : chiTietDiemQTJSON;
        const config = typeof cauHinhDiemJSON === 'string' ? JSON.parse(cauHinhDiemJSON) : cauHinhDiemJSON;
        let diemGK = 0;
        let coDiem = false;
        if (config.cotDiemQT && config.cotDiemQT.length > 0) {
            for (const cot of config.cotDiemQT) {
                const diem = chiTiet[cot.id];
                if (diem !== undefined && diem !== null && diem !== '') {
                    diemGK += parseFloat(diem) * (parseFloat(cot.weight) / 100);
                    coDiem = true;
                }
            }
        }
        return coDiem ? (Math.round(diemGK * 100) / 100) : null;
    } catch(e) {
        return null;
    }
};

/**
 * Quy đổi Điểm Số -> Điểm Chữ (Thang 10 -> Thang chữ)
 */
const quyDoiDiemChu = (diemTongKet) => {
    if (diemTongKet === null || diemTongKet === undefined) return null;
    if (diemTongKet >= 9.0) return 'A';
    if (diemTongKet >= 8.0) return 'B+';
    if (diemTongKet >= 7.0) return 'B';
    if (diemTongKet >= 6.5) return 'C+';
    if (diemTongKet >= 5.5) return 'C';
    if (diemTongKet >= 5.0) return 'D+';
    if (diemTongKet >= 4.0) return 'D';
    return 'F';
};

/**
 * Thuật toán Thi lại / Cải thiện (Quy chế 6.0)
 * - Thi lại (điểm gốc < 5.0): Điểm tối đa là 6.0
 * - Cải thiện (điểm gốc >= 5.0): Lấy điểm cao hơn
 */
const tinhDiemTongKetCuoiCung = (diemGoc, diemMoi) => {
    if (diemGoc < 5.0) {
        // Thi lại: Khống chế tối đa 6.0
        return Math.min(diemMoi, 6.0);
    }
    // Cải thiện: Lấy điểm cao hơn
    return Math.max(diemGoc, diemMoi);
};

// ============================================
// Nghiệp vụ chính
// ============================================

/**
 * Lấy danh sách Sinh viên + Điểm trong 1 Lớp Học Phần
 * (Dùng cho GV/Admin khi nhập điểm)
 */
const getDanhSachDiemByLHP = async (maLHP) => {
    const lhp = await LopHocPhan.findByPk(maLHP, {
        include: [
            { model: MonHoc, attributes: ['TenMon', 'SoTinChi'] },
            { model: HocKy, attributes: ['TenHK'] },
            { model: GiangVien, attributes: ['HoTen'] }
        ]
    });
    if (!lhp) throw new AppError(404, 'Không tìm thấy Lớp Học Phần');

    const danhSachDiem = await KetQuaHocTap.findAll({
        where: { MaLHP: maLHP },
        include: [{ model: SinhVien, attributes: ['MaSV', 'HoTen', 'MaLop'] }],
        order: [[SinhVien, 'HoTen', 'ASC']]
    });

    return {
        lopHocPhan: lhp,
        danhSachDiem
    };
};

/**
 * Cập nhật điểm cho 1 Sinh viên trong 1 LHP
 * Tự động tính DiemTongKet và DiemChu
 */
const capNhatDiem = async (maLHP, maSV, data, currentUser) => {
    // *** XÁC THỰC MẬT KHẨU TRƯỚC KHI LƯU ***
    await xacThucMatKhau(currentUser.UserID, data.password);
    // Kiểm tra LHP tồn tại
    const lhp = await LopHocPhan.findByPk(maLHP);
    if (!lhp) throw new AppError(404, 'Không tìm thấy Lớp Học Phần');

    // Kiểm tra quyền: GV chỉ được nhập điểm LHP mình dạy
    const role = await Role.findByPk(currentUser.RoleID);
    const isAdmin = role && role.RoleName === 'Admin';
    const isKhaoThi = role && role.RoleName === 'KhaoThi';
    const isGiangVien = role && role.RoleName === 'GiangVien';

    if (isAdmin) {
        throw new AppError(403, 'Admin chỉ được xem điểm, không được phép sửa điểm');
    }
    if (isGiangVien && lhp.MaGV !== currentUser.MaGV) {
        throw new AppError(403, 'Bạn không có quyền nhập điểm cho Lớp Học Phần này');
    }

    const ketQua = await KetQuaHocTap.findOne({
        where: { MaSV: maSV, MaLHP: maLHP },
        include: [{ model: SinhVien }]
    });
    if (!ketQua) throw new AppError(404, 'Sinh viên chưa đăng ký Lớp Học Phần này');
    
    // Lưu lại điểm cũ để ghi log
    const oldDiemTongKet = ketQua.DiemTongKet;

    if (isGiangVien) {
        if (data.ChiTietDiemQT !== undefined) {
            let existingChiTiet = {};
            if (ketQua.ChiTietDiemQT) {
                try { existingChiTiet = JSON.parse(ketQua.ChiTietDiemQT); } catch(e){}
            }
            const newChiTiet = { ...existingChiTiet, ...data.ChiTietDiemQT };
            ketQua.ChiTietDiemQT = JSON.stringify(newChiTiet);
            ketQua.DiemGK = tinhDiemGKTuChiTiet(ketQua.ChiTietDiemQT, lhp.CauHinhDiem);
        }
    } else if (isKhaoThi) {
        if (data.DiemCK !== undefined) ketQua.DiemCK = data.DiemCK;
        if (data.DiemThiLan1 !== undefined) ketQua.DiemThiLan1 = data.DiemThiLan1;
        if (data.DiemThiLan2 !== undefined) ketQua.DiemThiLan2 = data.DiemThiLan2;
    }

    const diemTKGoc = tinhDiemTongKet(ketQua.DiemGK, ketQua.DiemCK, lhp.CauHinhDiem);
    let diemCuoiCung = diemTKGoc;

    if (diemTKGoc !== null) {
        if (ketQua.DiemThiLan1 !== null && ketQua.DiemThiLan1 !== undefined) {
            const tkL1 = tinhDiemTongKet(ketQua.DiemGK, ketQua.DiemThiLan1, lhp.CauHinhDiem);
            if (tkL1 !== null) {
                diemCuoiCung = tinhDiemTongKetCuoiCung(diemTKGoc, tkL1);
            }
        }
        if (ketQua.DiemThiLan2 !== null && ketQua.DiemThiLan2 !== undefined) {
            const tkL2 = tinhDiemTongKet(ketQua.DiemGK, ketQua.DiemThiLan2, lhp.CauHinhDiem);
            if (tkL2 !== null) {
                const finalL2 = tinhDiemTongKetCuoiCung(diemTKGoc, tkL2);
                diemCuoiCung = Math.max(diemCuoiCung, finalL2);
            }
        }
    }

    ketQua.DiemTongKet = diemCuoiCung;
    ketQua.DiemChu = quyDoiDiemChu(diemCuoiCung);

    await ketQua.save();

    // Ghi log hoạt động
    let prefix = currentUser.RoleID === 2 ? `Giảng viên ${currentUser.Username}` : `Khảo thí ${currentUser.Username}`;
    if (currentUser.RoleID === 2 && currentUser.MaGV) {
        const gv = await GiangVien.findByPk(currentUser.MaGV);
        if (gv) prefix = `Giảng viên: ${gv.HoTen} - ${gv.MaGV}`;
    }
    const tenSV = ketQua.SinhVien ? ketQua.SinhVien.HoTen : 'Unknown';
    const hDong = oldDiemTongKet === null ? 'Nhập điểm' : 'Sửa điểm';
    const strOld = oldDiemTongKet !== null ? oldDiemTongKet : 'chưa có';
    
    await NhatKyHoatDong.create({
        NguoiDung: currentUser.Username,
        HanhDong: hDong,
        Loai: hDong === 'Sửa điểm' ? 'Cảnh báo' : 'Thông tin',
        ChiTiet: `${prefix} đã ${hDong.toLowerCase()} môn học của sinh viên ${maSV} - ${tenSV} từ ${strOld} thành ${diemCuoiCung}`
    });

    return ketQua;
};

/**
 * Cập nhật điểm hàng loạt cho nhiều SV trong 1 LHP
 * Sử dụng Transaction để đảm bảo tính toàn vẹn dữ liệu
 */
const capNhatDiemHangLoat = async (maLHP, danhSachDiem, password, currentUser) => {
    // *** XÁC THỰC MẬT KHẨU TRƯỚC KHI LƯU ***
    await xacThucMatKhau(currentUser.UserID, password);

    const transaction = await sequelize.transaction();
    try {
        // Kiểm tra LHP tồn tại
        const lhp = await LopHocPhan.findByPk(maLHP, { transaction });
        if (!lhp) throw new AppError(404, 'Không tìm thấy Lớp Học Phần');

        // Block if grades are locked
        if (lhp.TrangThaiNhapDiem === 'Đã chốt điểm') {
            throw new AppError(403, 'Lớp học phần này đã chốt điểm, không thể sửa chữa. Vui lòng xin phép mở khóa.');
        }

        // Kiểm tra quyền: GV chỉ được nhập điểm LHP mình dạy
        const role = await Role.findByPk(currentUser.RoleID, { transaction });
        const isAdmin = role && role.RoleName === 'Admin';
        const isKhaoThi = role && role.RoleName === 'KhaoThi';
        const isGiangVien = role && role.RoleName === 'GiangVien';

        if (isAdmin) {
            throw new AppError(403, 'Admin chỉ được xem điểm, không được phép sửa điểm');
        }
        if (isGiangVien && lhp.MaGV !== currentUser.MaGV) {
            throw new AppError(403, 'Bạn không có quyền nhập điểm cho Lớp Học Phần này');
        }

        const ketQuaList = [];

        for (const item of danhSachDiem) {
            const ketQua = await KetQuaHocTap.findOne({
                where: { MaSV: item.MaSV, MaLHP: maLHP },
                include: [{ model: SinhVien }],
                transaction
            });

            if (!ketQua) {
                throw new AppError(404, `Sinh viên ${item.MaSV} chưa đăng ký Lớp Học Phần này`);
            }
            
            const oldDiemTongKet = ketQua.DiemTongKet;

            if (isGiangVien) {
                if (item.ChiTietDiemQT !== undefined) {
                    let existingChiTiet = {};
                    if (ketQua.ChiTietDiemQT) {
                        try { existingChiTiet = JSON.parse(ketQua.ChiTietDiemQT); } catch(e){}
                    }
                    const newChiTiet = { ...existingChiTiet, ...item.ChiTietDiemQT };
                    ketQua.ChiTietDiemQT = JSON.stringify(newChiTiet);
                    ketQua.DiemGK = tinhDiemGKTuChiTiet(ketQua.ChiTietDiemQT, lhp.CauHinhDiem);
                }
            } else if (isKhaoThi) {
                if (item.DiemCK !== undefined) ketQua.DiemCK = item.DiemCK;
                if (item.DiemThiLan1 !== undefined) ketQua.DiemThiLan1 = item.DiemThiLan1;
                if (item.DiemThiLan2 !== undefined) ketQua.DiemThiLan2 = item.DiemThiLan2;
            }

            const diemTKGoc = tinhDiemTongKet(ketQua.DiemGK, ketQua.DiemCK, lhp.CauHinhDiem);
            let diemCuoiCung = diemTKGoc;

            if (diemTKGoc !== null) {
                if (ketQua.DiemThiLan1 !== null && ketQua.DiemThiLan1 !== undefined) {
                    const tkL1 = tinhDiemTongKet(ketQua.DiemGK, ketQua.DiemThiLan1, lhp.CauHinhDiem);
                    if (tkL1 !== null) {
                        diemCuoiCung = tinhDiemTongKetCuoiCung(diemTKGoc, tkL1);
                    }
                }
                if (ketQua.DiemThiLan2 !== null && ketQua.DiemThiLan2 !== undefined) {
                    const tkL2 = tinhDiemTongKet(ketQua.DiemGK, ketQua.DiemThiLan2, lhp.CauHinhDiem);
                    if (tkL2 !== null) {
                        const finalL2 = tinhDiemTongKetCuoiCung(diemTKGoc, tkL2);
                        diemCuoiCung = Math.max(diemCuoiCung, finalL2);
                    }
                }
            }

            ketQua.DiemTongKet = diemCuoiCung;
            ketQua.DiemChu = quyDoiDiemChu(diemCuoiCung);
            
            await ketQua.save({ transaction });
            ketQuaList.push(ketQua);

            // Chuẩn bị ghi log
            let prefix = currentUser.RoleID === 2 ? `Giảng viên ${currentUser.Username}` : `Khảo thí ${currentUser.Username}`;
            if (currentUser.RoleID === 2 && currentUser.MaGV) {
                const gv = await GiangVien.findByPk(currentUser.MaGV, { transaction });
                if (gv) prefix = `Giảng viên: ${gv.HoTen} - ${gv.MaGV}`;
            }
            const tenSV = ketQua.SinhVien ? ketQua.SinhVien.HoTen : 'Unknown';
            const hDong = oldDiemTongKet === null ? 'Nhập điểm' : 'Sửa điểm';
            const strOld = oldDiemTongKet !== null ? oldDiemTongKet : 'chưa có';
            
            await NhatKyHoatDong.create({
                NguoiDung: currentUser.Username,
                HanhDong: hDong,
                Loai: hDong === 'Sửa điểm' ? 'Cảnh báo' : 'Thông tin',
                ChiTiet: `${prefix} đã ${hDong.toLowerCase()} của sinh viên ${item.MaSV} - ${tenSV} từ ${strOld} thành ${diemCuoiCung}`
            }, { transaction });
        }

        // Update TrangThaiNhapDiem if it's the first time
        if (lhp.TrangThaiNhapDiem === 'Vui lòng nhập điểm' || !lhp.TrangThaiNhapDiem) {
            lhp.TrangThaiNhapDiem = 'Đang nhập liệu';
            await lhp.save({ transaction });
        }

        await transaction.commit();
        return ketQuaList;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * SV xem bảng điểm cá nhân (có thể lọc theo Học kỳ)
 */
const getBangDiemSinhVien = async (maSV, query = {}) => {
    // Kiểm tra SV tồn tại
    const sv = await SinhVien.findByPk(maSV);
    if (!sv) throw new AppError(404, 'Không tìm thấy Sinh Viên');

    // Xây dựng điều kiện lọc
    const whereCondition = { MaSV: maSV };
    const includeCondition = [
        {
            model: LopHocPhan,
            attributes: ['MaLHP', 'TenLopHP', 'MaHK'],
            include: [
                { model: MonHoc, attributes: ['MaMon', 'TenMon', 'SoTinChi'] },
                { model: HocKy, attributes: ['MaHK', 'TenHK', 'NamHocBatDau'] }
            ]
        }
    ];

    // Lọc theo Học kỳ nếu có
    if (query.MaHK) {
        includeCondition[0].where = { MaHK: query.MaHK };
    }

    const bangDiem = await KetQuaHocTap.findAll({
        where: whereCondition,
        include: includeCondition,
        order: [[LopHocPhan, HocKy, 'MaHK', 'ASC']]
    });

    // Tính tổng tín chỉ đã tích luỹ (chỉ tính các môn đạt: DiemTongKet >= 4.0)
    let tongTinChiTichLuy = 0;
    let tongDiemHeSo = 0;
    let tongTinChiTinh = 0;

    bangDiem.forEach(kq => {
        if (kq.DiemTongKet !== null && kq.DiemTongKet >= 4.0 && kq.LopHocPhan && kq.LopHocPhan.MonHoc) {
            const soTC = kq.LopHocPhan.MonHoc.SoTinChi;
            tongTinChiTichLuy += soTC;
            tongDiemHeSo += kq.DiemTongKet * soTC;
            tongTinChiTinh += soTC;
        }
    });

    const diemTrungBinhTichLuy = tongTinChiTinh > 0
        ? Math.round((tongDiemHeSo / tongTinChiTinh) * 100) / 100
        : 0;

    // Cảnh báo học vụ nếu GPA < 2.0 (quy đổi thang 4 ~ 5.0 thang 10)
    let canhBaoHocVu = null;
    if (tongTinChiTinh > 0 && diemTrungBinhTichLuy < 5.0) {
        canhBaoHocVu = '⚠️ CẢNH BÁO HỌC VỤ: Điểm trung bình tích lũy dưới 5.0';
    }

    return {
        sinhVien: {
            MaSV: sv.MaSV,
            HoTen: sv.HoTen,
            MaLop: sv.MaLop
        },
        tongTinChiTichLuy,
        diemTrungBinhTichLuy,
        canhBaoHocVu,
        bangDiem
    };
};

/**
 * Xử lý Thi lại / Cải thiện cho 1 bản ghi KetQuaHocTap
 */
const xuLyThiLaiCaiThien = async (maKQ, diemCKMoi, password, currentUser) => {
    // *** XÁC THỰC MẬT KHẨU TRƯỚC KHI LƯU ***
    await xacThucMatKhau(currentUser.UserID, password);

    const ketQua = await KetQuaHocTap.findByPk(maKQ, {
        include: [{ model: LopHocPhan }]
    });
    if (!ketQua) throw new AppError(404, 'Không tìm thấy bản ghi Kết quả học tập');

    // Kiểm tra quyền GV
    const role = await Role.findByPk(currentUser.RoleID);
    const isAdmin = role && role.RoleName === 'Admin';
    if (!isAdmin && ketQua.LopHocPhan.MaGV !== currentUser.MaGV) {
        throw new AppError(403, 'Bạn không có quyền nhập điểm cho Lớp Học Phần này');
    }

    // Phải có điểm gốc (DiemThiLan1) trước
    if (ketQua.DiemThiLan1 === null) {
        throw new AppError(400, 'Sinh viên chưa có điểm thi lần 1, không thể xử lý thi lại/cải thiện');
    }

    const diemGoc = ketQua.DiemThiLan1;

    // Lưu điểm thi lần 2
    ketQua.DiemThiLan2 = diemCKMoi;

    // Tính điểm tổng kết mới với điểm CK mới
    const diemTKMoi = tinhDiemTongKet(ketQua.DiemGK, diemCKMoi, ketQua.LopHocPhan.CauHinhDiem);

    // Áp dụng quy chế 6.0
    const diemCuoiCung = tinhDiemTongKetCuoiCung(diemGoc, diemTKMoi);

    // Xác định loại (thi lại hay cải thiện)
    const loai = diemGoc < 4.0 ? 'THI_LAI' : 'CAI_THIEN';

    ketQua.DiemCK = diemCKMoi;
    ketQua.DiemTongKet = diemCuoiCung;
    ketQua.DiemChu = quyDoiDiemChu(diemCuoiCung);
    ketQua.GhiChu = loai === 'THI_LAI'
        ? `Thi lại - Điểm gốc: ${diemGoc}, Điểm mới: ${diemTKMoi}, Áp dụng QC6.0 -> ${diemCuoiCung}`
        : `Cải thiện - Điểm gốc: ${diemGoc}, Điểm mới: ${diemTKMoi}, Lấy cao hơn -> ${diemCuoiCung}`;

    await ketQua.save();
    return ketQua;
};

const chotDiem = async (maLHP) => {
    const lhp = await LopHocPhan.findByPk(maLHP);
    if (!lhp) throw new AppError(404, 'Không tìm thấy Lớp Học Phần');
    if (lhp.TrangThaiNhapDiem === 'Đã chốt điểm') {
        throw new AppError(400, 'Lớp học phần này đã được chốt điểm từ trước.');
    }
    lhp.TrangThaiNhapDiem = 'Đã chốt điểm';
    await lhp.save();
    return lhp;
};

const yeuCauMoKhoa = async (maLHP, lyDo, currentUser) => {
    const lhp = await LopHocPhan.findByPk(maLHP);
    if (!lhp) throw new AppError(404, 'Không tìm thấy Lớp Học Phần');

    const { ThongBao, UserAccount } = require('../models');
    
    // Tìm admin (Lấy admin đầu tiên hoặc hệ thống)
    const adminUser = await UserAccount.findOne({ where: { RoleID: 1 } });
    const maNguoiNhan = adminUser ? adminUser.UserID.toString() : 'admin';

    const tb = await ThongBao.create({
        MaNguoiGui: currentUser.Username,
        MaNguoiNhan: maNguoiNhan,
        TieuDe: `Yêu cầu mở khóa điểm LHP ${lhp.TenLopHP || lhp.MaLHP}`,
        NoiDung: `Giảng viên ${currentUser.Username} yêu cầu mở khóa điểm cho lớp học phần ${lhp.MaLHP}. Lý do: ${lyDo}`,
        LoaiThongBao: 'YeuCauMoKhoaDiem',
        ThamChieuID: lhp.MaLHP
    });
    return tb;
};

const moKhoaDiem = async (maLHP, currentUser) => {
    const lhp = await LopHocPhan.findByPk(maLHP);
    if (!lhp) throw new AppError(404, 'Không tìm thấy Lớp Học Phần');
    
    lhp.TrangThaiNhapDiem = 'Đang nhập liệu';
    await lhp.save();

    const { ThongBao, UserAccount } = require('../models');
    // Gửi thông báo lại cho giảng viên
    const gvUser = await UserAccount.findOne({ where: { MaGV: lhp.MaGV } });
    if (gvUser) {
        await ThongBao.create({
            MaNguoiGui: currentUser.Username,
            MaNguoiNhan: gvUser.Username,
            TieuDe: `Đã mở khóa điểm LHP ${lhp.TenLopHP || lhp.MaLHP}`,
            NoiDung: `Admin đã chấp nhận yêu cầu mở khóa điểm cho lớp học phần ${lhp.MaLHP}. Bạn có thể tiếp tục nhập điểm.`,
            LoaiThongBao: 'HeThong',
            ThamChieuID: lhp.MaLHP
        });
    }

    return lhp;
};

module.exports = {
    getDanhSachDiemByLHP,
    capNhatDiem,
    capNhatDiemHangLoat,
    getBangDiemSinhVien,
    xuLyThiLaiCaiThien,
    tinhDiemTongKet,
    quyDoiDiemChu,
    tinhDiemTongKetCuoiCung,
    chotDiem,
    yeuCauMoKhoa,
    moKhoaDiem
};

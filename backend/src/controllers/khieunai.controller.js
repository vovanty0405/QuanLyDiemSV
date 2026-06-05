const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { DonKhieuNai, SinhVien, LopHocPhan, KetQuaHocTap, ThongBao, UserAccount, MonHoc, NhatKyHoatDong } = require('../models');
const diemService = require('../services/diem.service');

// Cập nhật điểm dựa trên công thức cơ bản
const calculateFinalGrade = (kq) => {
    const cauHinhDiemJSON = kq.LopHocPhan ? kq.LopHocPhan.CauHinhDiem : null;
    const diemTKGoc = diemService.tinhDiemTongKet(kq.DiemGK, kq.DiemCK, cauHinhDiemJSON);
    let diemCuoiCung = diemTKGoc;

    if (diemTKGoc !== null) {
        if (kq.DiemThiLan1 !== null && kq.DiemThiLan1 !== undefined) {
            const tkL1 = diemService.tinhDiemTongKet(kq.DiemGK, kq.DiemThiLan1, cauHinhDiemJSON);
            if (tkL1 !== null) {
                diemCuoiCung = diemService.tinhDiemTongKetCuoiCung(diemTKGoc, tkL1);
            }
        }
        if (kq.DiemThiLan2 !== null && kq.DiemThiLan2 !== undefined) {
            const tkL2 = diemService.tinhDiemTongKet(kq.DiemGK, kq.DiemThiLan2, cauHinhDiemJSON);
            if (tkL2 !== null) {
                const finalL2 = diemService.tinhDiemTongKetCuoiCung(diemTKGoc, tkL2);
                diemCuoiCung = Math.max(diemCuoiCung, finalL2);
            }
        }
    }

    kq.DiemTongKet = diemCuoiCung;
    kq.DiemChu = diemService.quyDoiDiemChu(diemCuoiCung);

    return kq;
};

exports.createComplaint = catchAsync(async (req, res) => {
    const { maLHP, lyDo, loaiDiem } = req.body;
    const sinhVien = await SinhVien.findOne({ where: { UserID: req.user.UserID } });
    
    if (!sinhVien) {
        throw new AppError(403, 'Chỉ sinh viên mới được gửi khiếu nại');
    }

    const maSV = sinhVien.MaSV;

    // Kiểm tra xem sinh viên có học lớp này không
    const ketQua = await KetQuaHocTap.findOne({ where: { MaSV: maSV, MaLHP: maLHP } });
    if (!ketQua) {
        throw new AppError(404, 'Không tìm thấy kết quả học tập của sinh viên trong lớp này');
    }

    const donKhieuNai = await DonKhieuNai.create({
        MaSV: maSV,
        MaLHP: maLHP,
        LyDo: lyDo,
        LoaiDiem: loaiDiem,
        TrangThai: 'pending'
    });

    // Tạo thông báo cho giảng viên của lớp học phần
    const lhp = await LopHocPhan.findByPk(maLHP, { include: [MonHoc] });
    if (lhp && lhp.MaGV) {
        // Tìm UserAccount của giảng viên
        const gvAccount = await UserAccount.findOne({ where: { MaGV: lhp.MaGV } });
        if (gvAccount) {
            await ThongBao.create({
                MaNguoiGui: maSV,
                MaNguoiNhan: gvAccount.UserID.toString(),
                TieuDe: 'Có khiếu nại mới',
                NoiDung: `SV ${maSV} gửi khiếu nại điểm ${loaiDiem} môn ${lhp.MonHoc?.TenMon || maLHP}.`,
                LoaiThongBao: 'warning',
                ThamChieuID: donKhieuNai.MaKN.toString()
            });

            // Emit socket
            const io = req.app.get('socketio');
            if (io) {
                io.to(gvAccount.UserID.toString()).emit('new_notification', {
                    title: 'Có khiếu nại mới',
                    message: `SV ${maSV} gửi khiếu nại điểm ${loaiDiem} môn ${lhp.MonHoc?.TenMon || maLHP}.`,
                    type: 'warning'
                });
            }
        }
    }
    
    await NhatKyHoatDong.create({
        NguoiDung: req.user.Username,
        HanhDong: 'Gửi khiếu nại',
        Loai: 'Thông tin',
        ChiTiet: `Sinh viên ${maSV} gửi khiếu nại điểm ${loaiDiem} môn ${lhp ? (lhp.MonHoc?.TenMon || maLHP) : maLHP}. Lý do: ${lyDo}`
    });

    res.status(201).json({
        status: 'success',
        data: donKhieuNai
    });
});

exports.getComplaints = catchAsync(async (req, res) => {
    // Giảng viên chỉ xem lớp mình dạy, Admin xem tất cả
    const roleId = req.user.RoleID;
    const maGV = req.user.MaGV;

    let whereClause = {};
    if (roleId === 2) { // Giảng viên
        if (!maGV) throw new AppError(403, 'Tài khoản giảng viên không hợp lệ');
        // Tìm các lớp học phần do GV này dạy
        const lhps = await LopHocPhan.findAll({ where: { MaGV: maGV }, attributes: ['MaLHP'] });
        const maLHPs = lhps.map(lhp => lhp.MaLHP);
        whereClause.MaLHP = maLHPs;
    }

    const complaints = await DonKhieuNai.findAll({
        where: whereClause,
        include: [
            { model: SinhVien, attributes: ['HoTen', 'MaLop'] },
            { model: LopHocPhan, include: [{ model: MonHoc, attributes: ['TenMon'] }] }
        ],
        order: [['NgayGui', 'DESC']]
    });

    // Lấy điểm cũ của từng sinh viên cho đơn khiếu nại để trả về chung
    const results = [];
    for (const c of complaints) {
        const kq = await KetQuaHocTap.findOne({ where: { MaSV: c.MaSV, MaLHP: c.MaLHP } });
        results.push({
            id: c.MaKN,
            studentId: c.MaSV,
            studentName: c.SinhVien ? c.SinhVien.HoTen : c.MaSV,
            courseId: c.MaLHP,
            courseName: c.LopHocPhan?.MonHoc?.TenMon || c.MaLHP,
            reason: c.LyDo,
            submitDate: c.NgayGui,
            status: c.TrangThai,
            appealedGrade: c.LoaiDiem,
            feedback: c.PhanHoi,
            oldGrades: kq ? {
                quatrinh: kq.DiemGK,
                cuoiky: kq.DiemCK,
                thiLan1: kq.DiemThiLan1,
                thiLan2: kq.DiemThiLan2
            } : {}
        });
    }

    res.status(200).json({
        status: 'success',
        data: results
    });
});

exports.processComplaint = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status, newGrade, feedback } = req.body;

    const complaint = await DonKhieuNai.findByPk(id);
    if (!complaint) {
        throw new AppError(404, 'Không tìm thấy đơn khiếu nại');
    }

    complaint.TrangThai = status;
    complaint.PhanHoi = feedback;
    await complaint.save();

    let kq = await KetQuaHocTap.findOne({ 
        where: { MaSV: complaint.MaSV, MaLHP: complaint.MaLHP },
        include: [{ model: LopHocPhan }] 
    });

    if (status === 'approved' && kq) {
        let val = parseFloat(newGrade);
        
        if (isNaN(val) || val < 0 || val > 10) {
            throw new AppError(400, 'Điểm không hợp lệ. Phải từ 0 đến 10.');
        }
        
        // Cập nhật điểm dựa theo loại điểm
        switch (complaint.LoaiDiem) {
            case 'quatrinh': kq.DiemGK = val; break;
            case 'cuoiky': kq.DiemCK = val; kq.DiemThiLan1 = val; break; // Giả sử CK = Thi L1
            case 'thiLan1': kq.DiemThiLan1 = val; kq.DiemCK = val; break;
            case 'thiLan2': 
                // Cơ chế thi lại: max 6 điểm
                if (val > 6.0) val = 6.0;
                kq.DiemThiLan2 = val; 
                break;
        }

        kq = calculateFinalGrade(kq);
        await kq.save();
    }

    // Gửi thông báo cho SV
    const sinhVien = await SinhVien.findOne({ where: { MaSV: complaint.MaSV } });
    if (sinhVien && sinhVien.UserID) {
        const title = status === 'approved' ? 'Khiếu nại được duyệt' : 'Khiếu nại bị từ chối';
        const msgType = status === 'approved' ? 'success' : 'error';
        const lhp = await LopHocPhan.findByPk(complaint.MaLHP, { include: [MonHoc] });
        
        await ThongBao.create({
            MaNguoiGui: req.user.UserID.toString(),
            MaNguoiNhan: sinhVien.UserID.toString(),
            TieuDe: title,
            NoiDung: `Đơn khiếu nại điểm môn ${lhp?.MonHoc?.TenMon || complaint.MaLHP} đã được xử lý. Phản hồi: ${feedback}`,
            LoaiThongBao: msgType,
            ThamChieuID: complaint.MaKN.toString()
        });

        const io = req.app.get('socketio');
        if (io) {
            io.to(sinhVien.UserID.toString()).emit('new_notification', {
                title: title,
                message: `Đơn khiếu nại điểm môn ${lhp?.MonHoc?.TenMon || complaint.MaLHP} đã được xử lý.`,
                type: msgType
            });
        }
    }
    
    await NhatKyHoatDong.create({
        NguoiDung: req.user.Username,
        HanhDong: status === 'approved' ? 'Duyệt khiếu nại' : 'Từ chối khiếu nại',
        Loai: 'Cảnh báo',
        ChiTiet: `Giảng viên/Khảo thí ${req.user.Username} đã ${status === 'approved' ? 'duyệt' : 'từ chối'} khiếu nại của SV ${complaint.MaSV} môn ${complaint.MaLHP}. Phản hồi: ${feedback}`
    });

    res.status(200).json({
        status: 'success',
        data: complaint
    });
});

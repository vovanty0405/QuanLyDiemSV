const diemService = require('../services/diem.service');
const catchAsync = require('../utils/catchAsync');

// Lấy danh sách SV + Điểm trong 1 LHP (cho GV/Admin nhập điểm)
const getDanhSachDiemByLHP = catchAsync(async (req, res) => {
    const result = await diemService.getDanhSachDiemByLHP(req.params.id);
    res.status(200).json({ status: 'success', message: 'Lấy danh sách điểm thành công', data: result });
});

// Cập nhật điểm 1 SV
const capNhatDiem = catchAsync(async (req, res) => {
    const ketQua = await diemService.capNhatDiem(req.params.id, req.params.maSV, req.body, req.user);
    res.status(200).json({ status: 'success', message: 'Cập nhật điểm thành công', data: ketQua });
});

// Cập nhật điểm hàng loạt
const capNhatDiemHangLoat = catchAsync(async (req, res) => {
    const ketQuaList = await diemService.capNhatDiemHangLoat(req.params.id, req.body.danhSachDiem, req.body.password, req.user);
    res.status(200).json({
        status: 'success',
        message: `Cập nhật điểm hàng loạt thành công cho ${ketQuaList.length} sinh viên`,
        data: ketQuaList
    });
});

// SV xem bảng điểm cá nhân (lấy MaSV từ JWT)
const getBangDiemCaNhan = catchAsync(async (req, res) => {
    const result = await diemService.getBangDiemSinhVien(req.user.MaSV, req.query);
    res.status(200).json({ status: 'success', message: 'Lấy bảng điểm thành công', data: result });
});

// Admin/GV xem bảng điểm của 1 SV bất kỳ
const getBangDiemSinhVien = catchAsync(async (req, res) => {
    const result = await diemService.getBangDiemSinhVien(req.params.maSV, req.query);
    res.status(200).json({ status: 'success', message: 'Lấy bảng điểm thành công', data: result });
});

// Xử lý Thi lại / Cải thiện
const xuLyThiLaiCaiThien = catchAsync(async (req, res) => {
    const ketQua = await diemService.xuLyThiLaiCaiThien(req.params.maKQ, req.body.DiemCK, req.body.password, req.user);
    res.status(200).json({ status: 'success', message: 'Xử lý thi lại/cải thiện thành công', data: ketQua });
});

const chotDiem = catchAsync(async (req, res) => {
    const lhp = await diemService.chotDiem(req.params.id);
    res.status(200).json({ status: 'success', message: 'Chốt bảng điểm thành công', data: lhp });
});

const yeuCauMoKhoa = catchAsync(async (req, res) => {
    const tb = await diemService.yeuCauMoKhoa(req.params.id, req.body.lyDo, req.user);
    res.status(200).json({ status: 'success', message: 'Gửi yêu cầu mở khóa thành công', data: tb });
});

const moKhoaDiem = catchAsync(async (req, res) => {
    const lhp = await diemService.moKhoaDiem(req.params.id, req.user);
    res.status(200).json({ status: 'success', message: 'Mở khóa điểm thành công', data: lhp });
});

module.exports = {
    getDanhSachDiemByLHP,
    capNhatDiem,
    capNhatDiemHangLoat,
    getBangDiemCaNhan,
    getBangDiemSinhVien,
    xuLyThiLaiCaiThien,
    chotDiem,
    yeuCauMoKhoa,
    moKhoaDiem
};

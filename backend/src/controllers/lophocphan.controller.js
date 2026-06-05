const lopHocPhanService = require('../services/lophocphan.service');
const catchAsync = require('../utils/catchAsync');

const getAllLopHocPhan = catchAsync(async (req, res) => {
    if (req.user && req.user.RoleID === 2) {
        req.query.MaGV = req.user.MaGV;
    }
    const result = await lopHocPhanService.getAllLopHocPhan(req.query);
    res.status(200).json({ status: 'success', message: 'Lấy danh sách Lớp Học Phần thành công', ...result });
});

const getLopHocPhanById = catchAsync(async (req, res) => {
    const lhp = await lopHocPhanService.getLopHocPhanById(req.params.id);
    res.status(200).json({ status: 'success', message: 'Lấy chi tiết Lớp Học Phần thành công', data: lhp });
});

const createLopHocPhan = catchAsync(async (req, res) => {
    const lhp = await lopHocPhanService.createLopHocPhan(req.body);
    res.status(201).json({ status: 'success', message: 'Tạo Lớp Học Phần thành công', data: lhp });
});

const updateLopHocPhan = catchAsync(async (req, res) => {
    const lhp = await lopHocPhanService.updateLopHocPhan(req.params.id, req.body);
    res.status(200).json({ status: 'success', message: 'Cập nhật Lớp Học Phần thành công', data: lhp });
});

const deleteLopHocPhan = catchAsync(async (req, res) => {
    await lopHocPhanService.deleteLopHocPhan(req.params.id);
    res.status(204).json({ status: 'success', message: 'Xoá Lớp Học Phần thành công', data: null });
});

const dangKyHocPhan = catchAsync(async (req, res) => {
    const ketQua = await lopHocPhanService.dangKyHocPhan(req.params.id, req.body.MaSV);
    res.status(201).json({ status: 'success', message: 'Đăng ký Học Phần thành công', data: ketQua });
});

const huyDangKy = catchAsync(async (req, res) => {
    await lopHocPhanService.huyDangKy(req.params.id, req.body.MaSV);
    res.status(200).json({ status: 'success', message: 'Huỷ đăng ký Học Phần thành công' });
});

const dangKyHocPhanHangLoat = catchAsync(async (req, res) => {
    // req.body.danhSachMaSV là một mảng
    const ketQua = await lopHocPhanService.dangKyHocPhanHangLoat(req.params.id, req.body.danhSachMaSV);
    res.status(200).json({ status: 'success', message: ketQua.message, data: ketQua });
});

const getLopHocPhanByGiangVien = catchAsync(async (req, res) => {
    // MaGV lấy từ JWT token (req.user.MaGV) hoặc từ params (cho Admin)
    const maGV = req.params.maGV || req.user.MaGV;
    const result = await lopHocPhanService.getLopHocPhanByGiangVien(maGV, req.query);
    res.status(200).json({ status: 'success', message: 'Lấy danh sách Lớp Học Phần của Giảng viên thành công', ...result });
});

const bulkCreateLopHocPhan = catchAsync(async (req, res) => {
    await lopHocPhanService.bulkCreateLopHocPhan(req.body);
    res.status(201).json({ status: 'success', message: "Nhập dữ liệu Lớp Học Phần thành công" });
});

const configGrades = catchAsync(async (req, res) => {
    // Chỉ GV mới được gọi (đã checkRole ở routes)
    const lhp = await lopHocPhanService.configGrades(req.params.id, req.user.MaGV, req.body);
    res.status(200).json({ status: 'success', message: 'Cấu hình điểm thành công', data: lhp });
});

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

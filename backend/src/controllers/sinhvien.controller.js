const sinhVienService = require('../services/sinhvien.service');
const catchAsync = require('../utils/catchAsync');

const getAllSinhVien = catchAsync(async (req, res) => {
    const result = await sinhVienService.getAllSinhVien(req.query);
    res.status(200).json({ status: 'success', message: "lấy danh sách thành công",...result });
});

const getSinhVienById = catchAsync(async (req, res) => {
    const sv = await sinhVienService.getSinhVienById(req.params.id);
    res.status(200).json({ status: 'success',message: "lấy danh sách thành công", data: sv });
});

const createSinhVien = catchAsync(async (req, res) => {
    const sv = await sinhVienService.createSinhVien(req.body);
    res.status(201).json({ status: 'success',message: "Thêm Sinh Viên thành công", data: sv });
});

const updateSinhVien = catchAsync(async (req, res) => {
    const sv = await sinhVienService.updateSinhVien(req.params.id, req.body);
    res.status(200).json({ status: 'success',message: "Cập nhật thành công", data: sv });
});

const deleteSinhVien = catchAsync(async (req, res) => {
    await sinhVienService.deleteSinhVien(req.params.id);
    res.status(204).json({ status: 'success', message: "Xóa thành công", data: null });
});

const getProfile = catchAsync(async (req, res) => {
    // req.user.UserID được gán từ JWT middleware
    const sv = await sinhVienService.getProfile(req.user.UserID);
    res.status(200).json({ status: 'success', data: sv });
});

const bulkCreateSinhVien = catchAsync(async (req, res) => {
    await sinhVienService.bulkCreateSinhVien(req.body);
    res.status(201).json({ status: 'success', message: "Nhập dữ liệu Sinh viên thành công" });
});

module.exports = {
    getAllSinhVien,
    getSinhVienById,
    createSinhVien,
    updateSinhVien,
    deleteSinhVien,
    getProfile,
    bulkCreateSinhVien
};

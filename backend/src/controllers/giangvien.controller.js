const giangVienService = require('../services/giangvien.service');
const catchAsync = require('../utils/catchAsync');

const getAllGiangVien = catchAsync(async (req, res) => {
    const result = await giangVienService.getAllGiangVien(req.query);
    res.status(200).json({ status: 'success', ...result });
});

const getGiangVienById = catchAsync(async (req, res) => {
    const gv = await giangVienService.getGiangVienById(req.params.id);
    res.status(200).json({ status: 'success', data: gv });
});

const createGiangVien = catchAsync(async (req, res) => {
    const gv = await giangVienService.createGiangVien(req.body);
    res.status(201).json({ status: 'success', data: gv });
});

const updateGiangVien = catchAsync(async (req, res) => {
    const gv = await giangVienService.updateGiangVien(req.params.id, req.body);
    res.status(200).json({ status: 'success', data: gv });
});

const deleteGiangVien = catchAsync(async (req, res) => {
    await giangVienService.deleteGiangVien(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});

const getProfile = catchAsync(async (req, res) => {
    const gv = await giangVienService.getProfile(req.user.UserID);
    res.status(200).json({ status: 'success', data: gv });
});

const bulkCreateGiangVien = catchAsync(async (req, res) => {
    await giangVienService.bulkCreateGiangVien(req.body);
    res.status(201).json({ status: 'success', message: "Nhập dữ liệu Giảng viên thành công" });
});

module.exports = {
    getAllGiangVien,
    getGiangVienById,
    createGiangVien,
    updateGiangVien,
    deleteGiangVien,
    getProfile,
    bulkCreateGiangVien
};

const khoaService = require('../services/khoa.service');
const catchAsync = require('../utils/catchAsync');

const getAllKhoa = catchAsync(async (req, res) => {
    const result = await khoaService.getAllKhoa(req.query);
    res.status(200).json({
        status: 'success',
        ...result
    });
});

const getKhoaById = catchAsync(async (req, res) => {
    const khoa = await khoaService.getKhoaById(req.params.id);
    res.status(200).json({
        status: 'success',
        data: khoa
    });
});

const createKhoa = catchAsync(async (req, res) => {
    const khoa = await khoaService.createKhoa(req.body);
    res.status(201).json({
        status: 'success',
        data: khoa
    });
});

const updateKhoa = catchAsync(async (req, res) => {
    const khoa = await khoaService.updateKhoa(req.params.id, req.body);
    res.status(200).json({
        status: 'success',
        data: khoa
    });
});

const deleteKhoa = catchAsync(async (req, res) => {
    await khoaService.deleteKhoa(req.params.id);
    res.status(204).json({
        status: 'success',
        data: null
    });
});

module.exports = {
    getAllKhoa,
    getKhoaById,
    createKhoa,
    updateKhoa,
    deleteKhoa
};

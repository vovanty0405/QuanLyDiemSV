const monHocService = require('../services/monhoc.service');
const catchAsync = require('../utils/catchAsync');

const getAllMonHoc = catchAsync(async (req, res) => {
    const result = await monHocService.getAllMonHoc(req.query);
    res.status(200).json({
        status: 'success',
        ...result
    });
});

const getMonHocById = catchAsync(async (req, res) => {
    const monHoc = await monHocService.getMonHocById(req.params.id);
    res.status(200).json({
        status: 'success',
        data: monHoc
    });
});

const createMonHoc = catchAsync(async (req, res) => {
    const monHoc = await monHocService.createMonHoc(req.body);
    res.status(201).json({
        status: 'success',
        data: monHoc
    });
});

const updateMonHoc = catchAsync(async (req, res) => {
    const monHoc = await monHocService.updateMonHoc(req.params.id, req.body);
    res.status(200).json({
        status: 'success',
        data: monHoc
    });
});

const deleteMonHoc = catchAsync(async (req, res) => {
    await monHocService.deleteMonHoc(req.params.id);
    res.status(204).json({
        status: 'success',
        data: null
    });
});

const bulkCreateMonHoc = catchAsync(async (req, res) => {
    if (!Array.isArray(req.body)) {
        return res.status(400).json({ status: 'fail', message: 'Dữ liệu không hợp lệ, yêu cầu một mảng (Array).' });
    }
    const result = await monHocService.bulkCreateMonHoc(req.body);
    res.status(201).json({
        status: 'success',
        data: result
    });
});

module.exports = {
    getAllMonHoc,
    getMonHocById,
    createMonHoc,
    updateMonHoc,
    deleteMonHoc,
    bulkCreateMonHoc
};

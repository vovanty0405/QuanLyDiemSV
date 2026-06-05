const lopHanhChinhService = require('../services/lophanhchinh.service');
const catchAsync = require('../utils/catchAsync');

const getAllLopHanhChinh = catchAsync(async (req, res) => {
    const result = await lopHanhChinhService.getAllLopHanhChinh(req.query);
    res.status(200).json({ status: 'success', ...result });
});

const getLopHanhChinhById = catchAsync(async (req, res) => {
    const lop = await lopHanhChinhService.getLopHanhChinhById(req.params.id);
    res.status(200).json({ status: 'success', data: lop });
});

const createLopHanhChinh = catchAsync(async (req, res) => {
    const lop = await lopHanhChinhService.createLopHanhChinh(req.body);
    res.status(201).json({ status: 'success', data: lop });
});

const updateLopHanhChinh = catchAsync(async (req, res) => {
    const lop = await lopHanhChinhService.updateLopHanhChinh(req.params.id, req.body);
    res.status(200).json({ status: 'success', data: lop });
});

const deleteLopHanhChinh = catchAsync(async (req, res) => {
    await lopHanhChinhService.deleteLopHanhChinh(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});

const bulkCreateLopHanhChinh = catchAsync(async (req, res) => {
    await lopHanhChinhService.bulkCreateLopHanhChinh(req.body);
    res.status(201).json({ status: 'success', message: 'Nhập dữ liệu thành công' });
});

module.exports = {
    getAllLopHanhChinh,
    getLopHanhChinhById,
    createLopHanhChinh,
    updateLopHanhChinh,
    deleteLopHanhChinh,
    bulkCreateLopHanhChinh
};

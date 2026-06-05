const hockyService = require('../services/hocky.service');
const catchAsync = require('../utils/catchAsync');

const getAllHocKy = catchAsync(async (req, res) => {
    const result = await hockyService.getAllHocKy(req.query);
    res.status(200).json({
        status: 'success',
        ...result
    });
});

const getHocKyById = catchAsync(async (req, res) => {
    const hk = await hockyService.getHocKyById(req.params.id);
    res.status(200).json({
        status: 'success',
        data: hk
    });
});

const createHocKy = catchAsync(async (req, res) => {
    const hk = await hockyService.createHocKy(req.body);
    res.status(201).json({
        status: 'success',
        data: hk
    });
});

const updateHocKy = catchAsync(async (req, res) => {
    const hk = await hockyService.updateHocKy(req.params.id, req.body);
    res.status(200).json({
        status: 'success',
        data: hk
    });
});

const deleteHocKy = catchAsync(async (req, res) => {
    await hockyService.deleteHocKy(req.params.id);
    res.status(204).json({
        status: 'success',
        data: null
    });
});

module.exports = {
    getAllHocKy,
    getHocKyById,
    createHocKy,
    updateHocKy,
    deleteHocKy
};

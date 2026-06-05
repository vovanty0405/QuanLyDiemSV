const nganhService = require('../services/nganh.service');
const catchAsync = require('../utils/catchAsync');

const getAllNganh = catchAsync(async (req, res) => {
    const result = await nganhService.getAllNganh(req.query);
    res.status(200).json({
        status: 'success',
        ...result
    });
});

const getNganhById = catchAsync(async (req, res) => {
    const nganh = await nganhService.getNganhById(req.params.id);
    res.status(200).json({
        status: 'success',
        data: nganh
    });
});

const createNganh = catchAsync(async (req, res) => {
    const nganh = await nganhService.createNganh(req.body);
    res.status(201).json({
        status: 'success',
        data: nganh
    });
});

const updateNganh = catchAsync(async (req, res) => {
    const nganh = await nganhService.updateNganh(req.params.id, req.body);
    res.status(200).json({
        status: 'success',
        data: nganh
    });
});

const deleteNganh = catchAsync(async (req, res) => {
    await nganhService.deleteNganh(req.params.id);
    res.status(204).json({
        status: 'success',
        data: null
    });
});

module.exports = {
    getAllNganh,
    getNganhById,
    createNganh,
    updateNganh,
    deleteNganh
};

const khungChuongTrinhService = require('../services/khungchuongtrinh.service');
const catchAsync = require('../utils/catchAsync');

const getKhungDaoTaoByNganh = catchAsync(async (req, res) => {
    const data = await khungChuongTrinhService.getKhungDaoTaoByNganh(req.params.maNganh);
    res.status(200).json({
        status: 'success',
        data
    });
});

const updateQuyDinhTotNghiep = catchAsync(async (req, res) => {
    const quyDinh = await khungChuongTrinhService.updateQuyDinhTotNghiep(req.params.maNganh, req.body);
    res.status(200).json({
        status: 'success',
        data: quyDinh
    });
});

const addMonToKhung = catchAsync(async (req, res) => {
    // req.body can be { data: [{ MaMon, HocKyDuKien, LoaiMon }] }
    const result = await khungChuongTrinhService.addMonToKhung(req.params.maNganh, req.body.data);
    res.status(201).json({
        status: 'success',
        data: result
    });
});

const removeMonFromKhung = catchAsync(async (req, res) => {
    await khungChuongTrinhService.removeMonFromKhung(req.params.maNganh, req.params.maMon);
    res.status(204).json({
        status: 'success',
        data: null
    });
});

module.exports = {
    getKhungDaoTaoByNganh,
    updateQuyDinhTotNghiep,
    addMonToKhung,
    removeMonFromKhung
};

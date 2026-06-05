const { NhatKyHoatDong } = require('../models');
const catchAsync = require('../utils/catchAsync');

const getAllLogs = catchAsync(async (req, res) => {
    const logs = await NhatKyHoatDong.findAll({
        order: [['ThoiGian', 'DESC']],
        limit: 1000 // Giới hạn lấy 1000 logs gần nhất
    });

    // Chuyển format để Frontend dùng luôn (id, account, time, action, type, description)
    const formattedLogs = logs.map(log => ({
        id: log.MaLog,
        account: log.NguoiDung,
        action: log.HanhDong,
        type: log.Loai,
        time: new Date(log.ThoiGian).toLocaleString('vi-VN'),
        description: log.ChiTiet
    }));

    res.status(200).json({
        status: 'success',
        data: formattedLogs
    });
});

module.exports = {
    getAllLogs
};

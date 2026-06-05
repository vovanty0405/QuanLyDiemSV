const catchAsync = require('../utils/catchAsync');
const { ThongBao } = require('../models');

exports.getNotifications = catchAsync(async (req, res) => {
    const userId = req.user.UserID.toString();

    const notifications = await ThongBao.findAll({
        where: { MaNguoiNhan: userId },
        order: [['NgayGui', 'DESC']],
        limit: 20
    });

    res.status(200).json({
        status: 'success',
        data: notifications
    });
});

exports.markAsRead = catchAsync(async (req, res) => {
    const userId = req.user.UserID.toString();

    await ThongBao.update(
        { DaDoc: true },
        { where: { MaNguoiNhan: userId, DaDoc: false } }
    );

    res.status(200).json({
        status: 'success',
        message: 'Marked all as read'
    });
});

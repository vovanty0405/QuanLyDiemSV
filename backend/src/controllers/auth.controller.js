const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');
const { NhatKyHoatDong } = require('../models');

const login = catchAsync(async (req, res) => {
    const { username, password } = req.body;
    let result;
    try {
        result = await authService.login(username, password);
    } catch (error) {
        // Log failed login attempt
        await NhatKyHoatDong.create({
            NguoiDung: username || 'Unknown',
            HanhDong: 'Đăng nhập thất bại',
            Loai: 'Lỗi',
            ChiTiet: `Đăng nhập thất bại. IP: ${req.ip || req.connection.remoteAddress}`
        });
        throw error;
    }
    
    // Log successful login
    await NhatKyHoatDong.create({
        NguoiDung: result.user.Username,
        HanhDong: 'Đăng nhập thành công',
        Loai: 'Thông tin',
        ChiTiet: `Tài khoản ${result.user.RoleName || result.user.Role?.RoleName || 'người dùng'} đăng nhập thành công. IP: ${req.ip || req.connection.remoteAddress}`
    });

    
    // Set cookie cho refresh token
    res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Chạy https trên production
        sameSite: 'strict',
        maxAge: 14 * 24 * 60 * 60 * 1000 // 14 ngày
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: result.user,
            accessToken: result.accessToken,
        }
    });
});

const refreshToken = catchAsync(async (req, res) => {
    const token = req.cookies.refreshToken;
    const newAccessToken = await authService.refreshToken(token);

    res.status(200).json({
        status: 'success',
        data: {
            accessToken: newAccessToken
        }
    });
});

const logout = catchAsync(async (req, res) => {
    const token = req.cookies.refreshToken;
    const ip = req.ip || req.connection.remoteAddress;
    await authService.logout(token, ip);

    res.clearCookie('refreshToken');
    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
    });
});

module.exports = {
    login,
    refreshToken,
    logout
};

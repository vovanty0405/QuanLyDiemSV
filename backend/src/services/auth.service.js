const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UserAccount, Role } = require('../models');
const AppError = require('../utils/AppError');


const ACCESS_TOKEN_TTL = '30m'
const REFRESH_TOKEN_TTL = 14*24*60*60*1000 //14 Ngay

// Hàm bổ trợ tạo Access Token (Sống 15 phút)
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            UserID: user.UserID,
            Username: user.Username,
            RoleID: user.RoleID,
            MaGV: user.MaGV,
            MaSV: user.MaSV
        },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: ACCESS_TOKEN_TTL }
    );
};

// Hàm bổ trợ tạo Refresh Token (Sống 7 ngày)
const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            UserID: user.UserID,
            Username: user.Username,
            RoleID: user.RoleID,
            MaGV: user.MaGV,
            MaSV: user.MaSV
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_TOKEN_TTL }
    );
};

const login = async (username, password) => {
    // 1. Tìm user
    const user = await UserAccount.findOne({
        where: { Username: username },
        include: [{ model: Role }] // Lấy kèm thông tin Role
    });

    if (!user) {
        throw new AppError(401, 'Incorrect username or password');
    }

    if (!user.IsActive) {
        throw new AppError(403, 'Account is disabled');
    }

    // 2. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
        throw new AppError(401, 'Incorrect username or password');
    }

    // 3. Tạo JWT Token
   const accessToken = generateAccessToken(user);
   const refreshToken = generateRefreshToken(user);

   // 4. Lưu session vào DB
   const { Session } = require('../models');
   const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL);
   await Session.create({
       UserID: user.UserID,
       RefreshToken: refreshToken,
       ExpiresAt: expiresAt
   });

    return {
        user: {
            UserID: user.UserID,
            Username: user.Username,
            Role: user.Role ? user.Role.RoleName : null
        },
        accessToken,
        refreshToken
    };
};

const refreshToken = async (token) => {
    if (!token) throw new AppError(401, 'No refresh token provided');

    // 1. Verify token
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        throw new AppError(401, 'Invalid or expired refresh token');
    }

    // 2. Kiểm tra trong DB xem có bị revoke hay không tồn tại không
    const { Session, UserAccount, Role } = require('../models');
    const session = await Session.findOne({
        where: { RefreshToken: token, IsRevoked: false }
    });

    if (!session) {
        throw new AppError(401, 'Refresh token is invalid or has been revoked');
    }

    // 3. Tìm user
    const user = await UserAccount.findByPk(decoded.UserID, {
        include: [{ model: Role }]
    });

    if (!user || !user.IsActive) {
        throw new AppError(401, 'User no longer exists or is deactivated');
    }

    // 4. Sinh access token mới
    const newAccessToken = generateAccessToken(user);
    return newAccessToken;
};

const logout = async (token, ip = '') => {
    if (!token) return true;
    const { Session, NhatKyHoatDong } = require('../models');
    // Set IsRevoked = true
    await Session.update(
        { IsRevoked: true },
        { where: { RefreshToken: token } }
    );
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, { ignoreExpiration: true });
        if (decoded && decoded.Username) {
            await NhatKyHoatDong.create({
                NguoiDung: decoded.Username,
                HanhDong: 'Đăng xuất',
                Loai: 'Thông tin',
                ChiTiet: `Người dùng ${decoded.Username} đăng xuất. IP: ${ip}`
            });
        }
    } catch (e) {
        // ignore error if token invalid
    }
    return true;
};

module.exports = {
    login,
    refreshToken,
    logout
};

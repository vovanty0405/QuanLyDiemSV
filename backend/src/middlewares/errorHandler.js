const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
    // 1. Log lỗi ra console để dev debug
    console.error("🔥 BẮT ĐƯỢC LỖI TẠI MIDDLEWARE:", err);

    // 2. Lấy status code từ lỗi nếu có, nếu không thì lấy từ res.statusCode, mặc định là 500
    let statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
    let message = err.message || 'Lỗi không xác định';
    let errors = null;

    // Xử lý lỗi riêng từ Zod (Validation)
    if (err.name === 'ZodError') {
        statusCode = 400;
        message = 'Validation Error';
        return res.status(statusCode).json({
            status: 'error',
            message,
            errors: err.errors // Trả về chi tiết lỗi từ Zod
        });
    }

    // Xử lý lỗi riêng từ Sequelize
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 400;
        message = err.errors.map(e => e.message).join(', ');
    }
    
    // Xử lý lỗi JWT
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid Token. Please log in again!';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Your token has expired. Please log in again!';
    }

    res.status(statusCode).json({
        status: statusCode >= 400 && statusCode < 500 ? 'fail' : 'error',
        message
    });
};

module.exports = errorHandler;

const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { Role } = require('../models');

const verifyToken = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError(401, 'Token đã hết hạn hoặc không đúng!'));
    }

    try {
        
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decoded; // { UserID, Username, RoleID, MaGV, iat, exp }
        next();
    } catch (err) {
        return next(err); // Sẽ được bắt bởi errorHandler (JsonWebTokenError hoặc TokenExpiredError)
    }
};

const checkRole = (allowedRoleNames) => {
    return async (req, res, next) => {
        try {
            // Lấy tên Role từ DB dựa vào RoleID trong token
            const role = await Role.findByPk(req.user.RoleID);
            if (!role || !allowedRoleNames.includes(role.RoleName)) {
                return next(new AppError(403, 'Bạn không có quyền để thực hiện hành động này'));
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    verifyToken,
    checkRole
};

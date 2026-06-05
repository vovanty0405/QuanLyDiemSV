const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const KetQuaHocTap = sequelize.define('KetQuaHocTap', {
    MaKQ: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    MaSV: {
        type: DataTypes.STRING(20)
    },
    MaLHP: {
        type: DataTypes.STRING(20)
    },
    DiemCC: {
        type: DataTypes.FLOAT
    },
    DiemGK: {
        type: DataTypes.FLOAT
    },
    DiemCK: {
        type: DataTypes.FLOAT
    },
    DiemChu: {
        type: DataTypes.STRING(5)
    },
    GhiChu: {
        type: DataTypes.STRING(255)
    },
    DiemThiLan1: {
        type: DataTypes.FLOAT
    },
    DiemThiLan2: {
        type: DataTypes.FLOAT
    },
    DiemTongKet: {
        type: DataTypes.FLOAT
    },
    ChiTietDiemQT: {
        type: DataTypes.TEXT, // Chứa JSON điểm chi tiết quá trình
        allowNull: true
    }
}, {
    tableName: 'KetQuaHocTap'
});

module.exports = KetQuaHocTap;

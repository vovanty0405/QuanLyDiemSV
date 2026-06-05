const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NhatKyHoatDong = sequelize.define('NhatKyHoatDong', {
    MaLog: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    NguoiDung: {
        type: DataTypes.STRING(100)
    },
    ThoiGian: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    HanhDong: {
        type: DataTypes.STRING(255)
    },
    ChiTiet: {
        type: DataTypes.TEXT
    },
    Loai: {
        type: DataTypes.STRING(50),
        defaultValue: 'Thông tin'
    }
}, {
    tableName: 'NhatKyHoatDong'
});

module.exports = NhatKyHoatDong;

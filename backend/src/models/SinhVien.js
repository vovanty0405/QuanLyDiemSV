const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SinhVien = sequelize.define('SinhVien', {
    MaSV: {
        type: DataTypes.STRING(20),
        primaryKey: true
    },
    HoTen: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    NgaySinh: {
        type: DataTypes.DATEONLY
    },
    GioiTinh: {
        type: DataTypes.STRING(10)
    },
    DiaChi: {
        type: DataTypes.STRING(255)
    },
    CCCD: {
        type: DataTypes.STRING(20)
    },
    Email: {
        type: DataTypes.STRING(255)
    },
    SDT: {
        type: DataTypes.STRING(20)
    },
    MaLop: {
        type: DataTypes.STRING(20)
    },
    TrangThai: {
        type: DataTypes.STRING(50)
    },
    UserID: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'SinhVien'
});

module.exports = SinhVien;

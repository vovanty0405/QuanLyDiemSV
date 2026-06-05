const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GiangVien = sequelize.define('GiangVien', {
    MaGV: {
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
    Email: {
        type: DataTypes.STRING(255)
    },
    SDT: {
        type: DataTypes.STRING(20)
    },
    HocVi: {
        type: DataTypes.STRING(100)
    },
    MaKhoa: {
        type: DataTypes.STRING(20)
    },
    UserID: {
        type: DataTypes.INTEGER
    },
    CCCD: {
        type: DataTypes.STRING(20)
    }
}, {
    tableName: 'GiangVien'
});

module.exports = GiangVien;

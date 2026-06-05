const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Khoa = sequelize.define('Khoa', {
    MaKhoa: {
        type: DataTypes.STRING(20),
        primaryKey: true
    },
    TenKhoa: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    NgayThanhLap: {
        type: DataTypes.DATEONLY
    },
    TruongKhoa: {
        type: DataTypes.STRING(100)
    }
}, {
    tableName: 'Khoa'
});

module.exports = Khoa;

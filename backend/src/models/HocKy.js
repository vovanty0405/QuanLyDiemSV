const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HocKy = sequelize.define('HocKy', {
    MaHK: {
        type: DataTypes.STRING(20),
        primaryKey: true
    },
    TenHK: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    NamHocBatDau: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    NamHocKetThuc: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'HocKy'
});

module.exports = HocKy;

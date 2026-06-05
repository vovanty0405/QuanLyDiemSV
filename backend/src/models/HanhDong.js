const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HanhDong = sequelize.define('HanhDong', {
    MaHanhDong: {
        type: DataTypes.STRING(50),
        primaryKey: true
    },
    TenHanhDong: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    MoTa: {
        type: DataTypes.STRING(255)
    }
}, {
    tableName: 'HanhDong',
    timestamps: false
});

module.exports = HanhDong;

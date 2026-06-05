const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChucNang = sequelize.define('ChucNang', {
    MaChucNang: {
        type: DataTypes.STRING(50),
        primaryKey: true
    },
    TenChucNang: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    MoTa: {
        type: DataTypes.STRING(255)
    }
}, {
    tableName: 'ChucNang',
    timestamps: false
});

module.exports = ChucNang;

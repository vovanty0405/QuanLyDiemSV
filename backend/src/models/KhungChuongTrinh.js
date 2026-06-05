const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const KhungChuongTrinh = sequelize.define('KhungChuongTrinh', {
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    MaNganh: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    MaMon: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    HocKyDuKien: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    LoaiMon: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    tableName: 'KhungChuongTrinh',
    indexes: [
        {
            unique: true,
            fields: ['MaNganh', 'MaMon']
        }
    ]
});

module.exports = KhungChuongTrinh;

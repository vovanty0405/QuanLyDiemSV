const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Nganh = sequelize.define('Nganh', {
    MaNganh: {
        type: DataTypes.STRING(20),
        primaryKey: true
    },
    TenNganh: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    MaKhoa: {
        type: DataTypes.STRING(20)
    }
}, {
    tableName: 'Nganh'
});

module.exports = Nganh;

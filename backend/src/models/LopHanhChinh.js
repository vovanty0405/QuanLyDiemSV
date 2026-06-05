const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LopHanhChinh = sequelize.define('LopHanhChinh', {
    MaLop: {
        type: DataTypes.STRING(20),
        primaryKey: true
    },
    TenLop: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    NienKhoa: {
        type: DataTypes.STRING(50)
    },
    MaNganh: {
        type: DataTypes.STRING(20)
    },
    MaGVCN: {
        type: DataTypes.STRING(20)
    }
}, {
    tableName: 'LopHanhChinh'
});

module.exports = LopHanhChinh;

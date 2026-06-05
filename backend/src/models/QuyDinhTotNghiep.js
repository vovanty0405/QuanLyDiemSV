const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuyDinhTotNghiep = sequelize.define('QuyDinhTotNghiep', {
    MaNganh: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false
    },
    TongTTC: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 130
    },
    TCBatBuoc: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100
    },
    TCTuChon: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30
    },
    MinGPA: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 2.0
    }
}, {
    tableName: 'QuyDinhTotNghiep',
    timestamps: true
});

module.exports = QuyDinhTotNghiep;

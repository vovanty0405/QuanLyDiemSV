const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ThongBao = sequelize.define('ThongBao', {
    MaThongBao: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    MaNguoiGui: {
        type: DataTypes.STRING(20)
    },
    MaNguoiNhan: {
        type: DataTypes.STRING(20)
    },
    TieuDe: {
        type: DataTypes.STRING(255)
    },
    NoiDung: {
        type: DataTypes.TEXT
    },
    LoaiThongBao: {
        type: DataTypes.STRING(50)
    },
    ThamChieuID: {
        type: DataTypes.STRING(50)
    },
    NgayGui: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    DaDoc: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'ThongBao'
});

module.exports = ThongBao;

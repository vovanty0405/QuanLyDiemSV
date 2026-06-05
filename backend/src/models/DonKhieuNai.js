const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DonKhieuNai = sequelize.define('DonKhieuNai', {
    MaKN: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    MaSV: {
        type: DataTypes.STRING(20)
    },
    MaLHP: {
        type: DataTypes.STRING(20)
    },
    LyDo: {
        type: DataTypes.TEXT
    },
    LoaiDiem: {
        type: DataTypes.STRING(50)
    },
    NgayGui: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    TrangThai: {
        type: DataTypes.STRING(50)
    },
    PhanHoi: {
        type: DataTypes.TEXT
    },
    DaXem: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'DonKhieuNai'
});

module.exports = DonKhieuNai;

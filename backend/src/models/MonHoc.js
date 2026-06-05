const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MonHoc = sequelize.define('MonHoc', {
    MaMon: {
        type: DataTypes.STRING(20),
        primaryKey: true
    },
    TenMon: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    SoTinChi: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    SoTietLyThuyet: {
        type: DataTypes.INTEGER
    },
    SoTietThucHanh: {
        type: DataTypes.INTEGER
    },
    MaKhoa: {
        type: DataTypes.STRING(20)
    }
}, {
    tableName: 'MonHoc'
});

module.exports = MonHoc;

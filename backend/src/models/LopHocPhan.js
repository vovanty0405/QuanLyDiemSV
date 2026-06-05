const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LopHocPhan = sequelize.define('LopHocPhan', {
    MaLHP: {
        type: DataTypes.STRING(20),
        primaryKey: true
    },
    MaMon: {
        type: DataTypes.STRING(20)
    },
    MaHK: {
        type: DataTypes.STRING(20)
    },
    MaGV: {
        type: DataTypes.STRING(20)
    },
    TenLopHP: {
        type: DataTypes.STRING(255)
    },
    PhongHoc: {
        type: DataTypes.STRING(50)
    },
    SiSoToiDa: {
        type: DataTypes.INTEGER
    },
    TrangThai: {
        type: DataTypes.STRING(50)
    },
    CauHinhDiem: {
        type: DataTypes.TEXT, // Chứa JSON cấu hình trọng số và cột điểm quá trình
        allowNull: true
    },
    TrangThaiNhapDiem: {
        type: DataTypes.STRING(50),
        defaultValue: 'Vui lòng nhập điểm'
    }
}, {
    tableName: 'LopHocPhan'
});

module.exports = LopHocPhan;

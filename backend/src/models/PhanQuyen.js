const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PhanQuyen = sequelize.define('PhanQuyen', {
    RoleID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'Role',
            key: 'RoleID'
        }
    },
    MaChucNang: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        references: {
            model: 'ChucNang',
            key: 'MaChucNang'
        }
    },
    MaHanhDong: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        references: {
            model: 'HanhDong',
            key: 'MaHanhDong'
        }
    }
}, {
    tableName: 'PhanQuyen',
    timestamps: false
});

module.exports = PhanQuyen;

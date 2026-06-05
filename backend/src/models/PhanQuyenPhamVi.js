const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PhanQuyenPhamVi = sequelize.define('PhanQuyenPhamVi', {
    RoleID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'Role',
            key: 'RoleID'
        }
    },
    MaPhamVi: {
        type: DataTypes.STRING(50),
        primaryKey: true
    },
    Module: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Rule: {
        type: DataTypes.STRING(255)
    },
    IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'PhanQuyenPhamVi',
    timestamps: false
});

module.exports = PhanQuyenPhamVi;

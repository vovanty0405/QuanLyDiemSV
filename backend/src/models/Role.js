const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('Role', {
    RoleID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    RoleName: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    MoTa: {
        type: DataTypes.STRING(255)
    }
}, {
    tableName: 'Role'
});

module.exports = Role;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserAccount = sequelize.define('UserAccount', {
    UserID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    PasswordHash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    RoleID: {
        type: DataTypes.INTEGER
    },
    IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    NgayTao: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    MaGV: {
        type: DataTypes.STRING(20)
    }
}, {
    tableName: 'UserAccount'
});

module.exports = UserAccount;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Session = sequelize.define('Session', {
    SessionID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    UserID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    RefreshToken: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    ExpiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    IsRevoked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'Session'
});

module.exports = Session;

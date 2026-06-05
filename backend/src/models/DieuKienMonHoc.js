const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DieuKienMonHoc = sequelize.define('DieuKienMonHoc', {
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    MaMon: {
        type: DataTypes.STRING(20)
    },
    MaMonTienQuyet: {
        type: DataTypes.STRING(20)
    }
}, {
    tableName: 'DieuKienMonHoc'
});

module.exports = DieuKienMonHoc;

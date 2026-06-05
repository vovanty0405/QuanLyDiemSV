require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, Role, UserAccount } = require('./models');

const seed = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to Database for seeding...');

        // Tạo Role
        const roleAdmin = await Role.findOrCreate({
            where: { RoleName: 'Admin' },
            defaults: { MoTa: 'Quản trị viên hệ thống' }
        });
        const roleGV = await Role.findOrCreate({
            where: { RoleName: 'GiangVien' },
            defaults: { MoTa: 'Giảng viên' }
        });
        const roleSV = await Role.findOrCreate({
            where: { RoleName: 'SinhVien' },
            defaults: { MoTa: 'Sinh viên' }
        });

        console.log('Roles created/verified.');

        // Tạo Admin User
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await UserAccount.findOrCreate({
            where: { Username: 'admin' },
            defaults: {
                PasswordHash: hashedPassword,
                RoleID: roleAdmin[0].RoleID,
                IsActive: true
            }
        });

        // Tạo Giảng viên User
        const hashGV = await bcrypt.hash('gv123', 10);
        await UserAccount.findOrCreate({
            where: { Username: 'gv01' },
            defaults: {
                PasswordHash: hashGV,
                RoleID: roleGV[0].RoleID,
                IsActive: true
            }
        });

        console.log('Test users created successfully!');
        console.log('---------------------------------');
        console.log('Admin account: admin / admin123');
        console.log('GiangVien account: gv01 / gv123');
        console.log('---------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seed();

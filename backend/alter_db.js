const sequelize = require('./src/config/database');

async function migrate() {
    try {
        console.log('Running ALTER TABLE...');
        await sequelize.query("ALTER TABLE LopHocPhan ADD COLUMN TrangThaiNhapDiem VARCHAR(50) DEFAULT 'Vui lòng nhập điểm';");
        console.log('ALTER TABLE SUCCESSFUL');
    } catch (e) {
        if (e.name === 'SequelizeDatabaseError' && e.message.includes('Duplicate column name')) {
            console.log('Column already exists, ignoring.');
        } else {
            console.error('ALTER TABLE FAILED', e);
        }
    } finally {
        await sequelize.close();
    }
}

migrate();

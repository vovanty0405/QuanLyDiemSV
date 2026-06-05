const { ChucNang, HanhDong, Role, sequelize } = require('./models');

const seedRBAC = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB for RBAC seed...');

        const chucNangs = [
            { MaChucNang: 'dashboard', TenChucNang: 'Trang chủ' },
            { MaChucNang: 'lophocphan', TenChucNang: 'Quản lý Lớp học phần' },
            { MaChucNang: 'lophanhchinh', TenChucNang: 'Quản lý Lớp hành chính' },
            { MaChucNang: 'monhoc', TenChucNang: 'Quản lý Môn học' },
            { MaChucNang: 'diemso', TenChucNang: 'Quản lý Điểm số' },
            { MaChucNang: 'tracuudiem', TenChucNang: 'Tra cứu điểm' },
            { MaChucNang: 'taikhoan', TenChucNang: 'Quản lý Tài khoản' },
            { MaChucNang: 'thongke', TenChucNang: 'Thống kê & Báo cáo' }
        ];

        for (const cn of chucNangs) {
            await ChucNang.findOrCreate({ where: { MaChucNang: cn.MaChucNang }, defaults: cn });
        }

        const hanhDongs = [
            { MaHanhDong: 'view', TenHanhDong: 'Xem (View)' },
            { MaHanhDong: 'add', TenHanhDong: 'Thêm (Add)' },
            { MaHanhDong: 'edit', TenHanhDong: 'Sửa (Edit)' },
            { MaHanhDong: 'delete', TenHanhDong: 'Xóa (Delete)' },
            { MaHanhDong: 'other', TenHanhDong: 'Khác (Other)' }
        ];

        for (const hd of hanhDongs) {
            await HanhDong.findOrCreate({ where: { MaHanhDong: hd.MaHanhDong }, defaults: hd });
        }

        console.log('RBAC seed completed.');
        process.exit(0);
    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
};

seedRBAC();

const parsedData = require('./src/data/parsed_ctdt.json');
/**
 * ==========================================================================
 *  SEED.JS - Tạo bộ dữ liệu giả lớn cho CSDL "QuanLyDiemSV"
 *  Chạy: node seed.js
 *  Yêu cầu: npm install @faker-js/faker bcrypt
 * ==========================================================================
 */

require('dotenv').config();
const { Sequelize, DataTypes, Op } = require('sequelize');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker/locale/vi');

// ========== KẾT NỐI DATABASE ==========
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
        define: { timestamps: false, freezeTableName: true }
    }
);

// ========== HELPERS ==========
const round = (num, decimals = 1) => Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
const randFloat = (min, max) => round(Math.random() * (max - min) + min);
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const quyDoiDiemChu = (diem) => {
    if (diem === null || diem === undefined) return null;
    if (diem >= 9.0) return 'A+';
    if (diem >= 8.5) return 'A';
    if (diem >= 8.0) return 'B+';
    if (diem >= 7.0) return 'B';
    if (diem >= 6.5) return 'C+';
    if (diem >= 5.5) return 'C';
    if (diem >= 5.0) return 'D+';
    if (diem >= 4.0) return 'D';
    return 'F';
};

// Tên Việt Nam thực tế
const hoViet = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const demNam = ['Văn', 'Đức', 'Quang', 'Minh', 'Hoàng', 'Hữu', 'Thanh', 'Xuân', 'Anh', 'Bảo', 'Huy', 'Trọng'];
const demNu = ['Thị', 'Ngọc', 'Thanh', 'Phương', 'Kim', 'Thu', 'Hồng', 'Minh', 'Thùy'];
const tenNam = ['An', 'Bình', 'Cường', 'Đạt', 'Em', 'Phúc', 'Giang', 'Hải', 'Khoa', 'Lâm', 'Minh', 'Nam', 'Phong', 'Quân', 'Sơn', 'Tài', 'Tuấn', 'Uy', 'Vinh', 'Dũng', 'Kiệt', 'Long', 'Thành', 'Trí', 'Hùng', 'Nghĩa', 'Luân', 'Toàn'];
const tenNu = ['An', 'Bích', 'Chi', 'Diễm', 'Dung', 'Hà', 'Hằng', 'Hiền', 'Hoa', 'Hương', 'Linh', 'Mai', 'My', 'Ngân', 'Nhung', 'Oanh', 'Phượng', 'Quyên', 'Thảo', 'Trang', 'Trinh', 'Vy', 'Xuân', 'Yến', 'Lan', 'Nhi', 'Trâm', 'Như'];

const randomVietnameseName = () => {
    const isMale = Math.random() > 0.45;
    const ho = pick(hoViet);
    const dem = isMale ? pick(demNam) : pick(demNu);
    const ten = isMale ? pick(tenNam) : pick(tenNu);
    return { name: `${ho} ${dem} ${ten}`, gender: isMale ? 'Nam' : 'Nữ' };
};

const phongHocList = ['A101', 'A102', 'A201', 'A202', 'A301', 'B101', 'B102', 'B201', 'B202', 'C101', 'C201', 'C301', 'D101', 'D201', 'E101'];

// ========== DỮ LIỆU CỐ ĐỊNH ==========

// --- KHOA ---
const khoaData = [
    { MaKhoa: 'CNTT', TenKhoa: 'Công nghệ Thông tin', NgayThanhLap: '2000-01-15', TruongKhoa: 'PGS.TS Nguyễn Văn Hùng' },
    { MaKhoa: 'SP', TenKhoa: 'Sư phạm', NgayThanhLap: '1998-05-20', TruongKhoa: 'PGS.TS Trần Thị Minh' },
    { MaKhoa: 'KT', TenKhoa: 'Kinh tế', NgayThanhLap: '2002-09-01', TruongKhoa: 'TS. Lê Quang Đạo' },
    { MaKhoa: 'NN', TenKhoa: 'Nông nghiệp - TNTN', NgayThanhLap: '1995-03-10', TruongKhoa: 'PGS.TS Phạm Văn Thành' },
];

// --- NGÀNH ---
const nganhData = [
    // CNTT
    { MaNganh: 'KTPM', TenNganh: 'Kỹ thuật phần mềm', MaKhoa: 'CNTT' },
    { MaNganh: 'HTTT', TenNganh: 'Hệ thống thông tin', MaKhoa: 'CNTT' },
    { MaNganh: 'KHMT', TenNganh: 'Khoa học máy tính', MaKhoa: 'CNTT' },
    // SP
    { MaNganh: 'SPTOAN', TenNganh: 'Sư phạm Toán học', MaKhoa: 'SP' },
    { MaNganh: 'SPTA', TenNganh: 'Sư phạm Tiếng Anh', MaKhoa: 'SP' },
    { MaNganh: 'SPNV', TenNganh: 'Sư phạm Ngữ Văn', MaKhoa: 'SP' },
    // KT
    { MaNganh: 'QTKD', TenNganh: 'Quản trị kinh doanh', MaKhoa: 'KT' },
    { MaNganh: 'KETOAN', TenNganh: 'Kế toán', MaKhoa: 'KT' },
    { MaNganh: 'MKT', TenNganh: 'Marketing', MaKhoa: 'KT' },
    // NN
    { MaNganh: 'NH', TenNganh: 'Nông học', MaKhoa: 'NN' },
    { MaNganh: 'CN', TenNganh: 'Chăn nuôi', MaKhoa: 'NN' },
    { MaNganh: 'NTTS', TenNganh: 'Nuôi trồng thủy sản', MaKhoa: 'NN' },
];

// --- HỌC KỲ ---
const hocKyData = [];
let hkIndex = 1;
for (let year = 2022; year <= 2025; year++) {
    for (let sem = 1; sem <= 2; sem++) {
        hocKyData.push({
            MaHK: `HK${hkIndex}`,
            TenHK: `Học kỳ ${sem}`,
            NamHocBatDau: year,
            NamHocKetThuc: year + 1
        });
        hkIndex++;
    }
}

// --- MÔN HỌC ---
const allMonHoc = parsedData.monHocList;

// --- KHUNG CHƯƠNG TRÌNH ---
const khungCTMap = {};
for (const item of parsedData.khungChuongTrinhList) {
    if (!khungCTMap[item.MaNganh]) khungCTMap[item.MaNganh] = [];
    khungCTMap[item.MaNganh].push(item);
}

// --- GIẢNG VIÊN (15 GV) ---
const giangVienData = [
    { MaGV: 'GV001', HoTen: 'Nguyễn Văn Hùng', GioiTinh: 'Nam', HocVi: 'PGS.TS', MaKhoa: 'CNTT', Email: 'nvhung@edu.vn', SDT: '0901000001' },
    { MaGV: 'GV002', HoTen: 'Trần Thị Minh', GioiTinh: 'Nữ', HocVi: 'PGS.TS', MaKhoa: 'SP', Email: 'ttminh@edu.vn', SDT: '0901000002' },
    { MaGV: 'GV003', HoTen: 'Lê Quang Đạo', GioiTinh: 'Nam', HocVi: 'TS', MaKhoa: 'KT', Email: 'lqdao@edu.vn', SDT: '0901000003' },
    { MaGV: 'GV004', HoTen: 'Phạm Văn Thành', GioiTinh: 'Nam', HocVi: 'PGS.TS', MaKhoa: 'NN', Email: 'pvthanh@edu.vn', SDT: '0901000004' },
    { MaGV: 'GV005', HoTen: 'Hoàng Thị Lan', GioiTinh: 'Nữ', HocVi: 'TS', MaKhoa: 'CNTT', Email: 'htlan@edu.vn', SDT: '0901000005' },
    { MaGV: 'GV006', HoTen: 'Vũ Đức Cường', GioiTinh: 'Nam', HocVi: 'ThS', MaKhoa: 'CNTT', Email: 'vdcuong@edu.vn', SDT: '0901000006' },
    { MaGV: 'GV007', HoTen: 'Đặng Thị Hồng', GioiTinh: 'Nữ', HocVi: 'TS', MaKhoa: 'SP', Email: 'dthong@edu.vn', SDT: '0901000007' },
    { MaGV: 'GV008', HoTen: 'Bùi Minh Tuấn', GioiTinh: 'Nam', HocVi: 'ThS', MaKhoa: 'SP', Email: 'bmtuan@edu.vn', SDT: '0901000008' },
    { MaGV: 'GV009', HoTen: 'Ngô Hữu Phúc', GioiTinh: 'Nam', HocVi: 'TS', MaKhoa: 'KT', Email: 'nhphuc@edu.vn', SDT: '0901000009' },
    { MaGV: 'GV010', HoTen: 'Phan Ngọc Mai', GioiTinh: 'Nữ', HocVi: 'ThS', MaKhoa: 'KT', Email: 'pnmai@edu.vn', SDT: '0901000010' },
    { MaGV: 'GV011', HoTen: 'Dương Văn Sơn', GioiTinh: 'Nam', HocVi: 'TS', MaKhoa: 'NN', Email: 'dvson@edu.vn', SDT: '0901000011' },
    { MaGV: 'GV012', HoTen: 'Lý Thị Trang', GioiTinh: 'Nữ', HocVi: 'ThS', MaKhoa: 'NN', Email: 'lttrang@edu.vn', SDT: '0901000012' },
    { MaGV: 'GV013', HoTen: 'Hồ Quang Vinh', GioiTinh: 'Nam', HocVi: 'TS', MaKhoa: 'CNTT', Email: 'hqvinh@edu.vn', SDT: '0901000013' },
    { MaGV: 'GV014', HoTen: 'Trần Thanh Hà', GioiTinh: 'Nữ', HocVi: 'ThS', MaKhoa: 'SP', Email: 'ttha@edu.vn', SDT: '0901000014' },
    { MaGV: 'GV015', HoTen: 'Nguyễn Bảo Long', GioiTinh: 'Nam', HocVi: 'TS', MaKhoa: 'KT', Email: 'nblong@edu.vn', SDT: '0901000015' },
];

const gvByKhoa = {
    CNTT: ['GV001', 'GV005', 'GV006', 'GV013'],
    SP: ['GV002', 'GV007', 'GV008', 'GV014'],
    KT: ['GV003', 'GV009', 'GV010', 'GV015'],
    NN: ['GV004', 'GV011', 'GV012'],
};

// ========== SEED FUNCTIONS ==========

async function seedRoles() {
    console.log('🔧 Seeding Roles...');
    const roles = [
        { RoleID: 1, RoleName: 'Admin', MoTa: 'Quản trị viên hệ thống' },
        { RoleID: 2, RoleName: 'GiangVien', MoTa: 'Giảng viên' },
        { RoleID: 3, RoleName: 'SinhVien', MoTa: 'Sinh viên' },
        { RoleID: 4, RoleName: 'KhaoThi', MoTa: 'Phòng Khảo thí' },
    ];
    for (const r of roles) {
        await sequelize.query(
            `INSERT IGNORE INTO Role (RoleID, RoleName, MoTa) VALUES (:RoleID, :RoleName, :MoTa)`,
            { replacements: r }
        );
    }
    console.log('   ✅ Đã tạo xong 4 Roles');

    console.log('🔧 Seeding RBAC Features (ChucNang, HanhDong)...');
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
        await sequelize.query(
            `INSERT IGNORE INTO ChucNang (MaChucNang, TenChucNang) VALUES (:MaChucNang, :TenChucNang)`,
            { replacements: cn }
        );
    }
    const hanhDongs = [
        { MaHanhDong: 'view', TenHanhDong: 'Xem (View)' },
        { MaHanhDong: 'add', TenHanhDong: 'Thêm (Add)' },
        { MaHanhDong: 'edit', TenHanhDong: 'Sửa (Edit)' },
        { MaHanhDong: 'delete', TenHanhDong: 'Xóa (Delete)' },
        { MaHanhDong: 'other', TenHanhDong: 'Khác (Other)' }
    ];
    for (const hd of hanhDongs) {
        await sequelize.query(
            `INSERT IGNORE INTO HanhDong (MaHanhDong, TenHanhDong) VALUES (:MaHanhDong, :TenHanhDong)`,
            { replacements: hd }
        );
    }

    console.log('🔧 Cấp toàn quyền cho Admin...');
    for (const cn of chucNangs) {
        for (const hd of hanhDongs) {
            await sequelize.query(
                `INSERT IGNORE INTO PhanQuyen (RoleID, MaChucNang, MaHanhDong) VALUES (1, :MaChucNang, :MaHanhDong)`,
                { replacements: { MaChucNang: cn.MaChucNang, MaHanhDong: hd.MaHanhDong } }
            );
        }
    }
    console.log('   ✅ Đã cấp xong toàn quyền Admin');
}

async function seedKhoaNganh() {
    console.log('🏫 Seeding Khoa...');
    for (const k of khoaData) {
        await sequelize.query(
            `INSERT IGNORE INTO Khoa (MaKhoa, TenKhoa, NgayThanhLap, TruongKhoa) VALUES (:MaKhoa, :TenKhoa, :NgayThanhLap, :TruongKhoa)`,
            { replacements: k }
        );
    }
    console.log(`   ✅ Đã tạo xong ${khoaData.length} Khoa`);

    console.log('📚 Seeding Ngành...');
    for (const n of nganhData) {
        await sequelize.query(
            `INSERT IGNORE INTO Nganh (MaNganh, TenNganh, MaKhoa) VALUES (:MaNganh, :TenNganh, :MaKhoa)`,
            { replacements: n }
        );
    }
    console.log(`   ✅ Đã tạo xong ${nganhData.length} Ngành`);
}

async function seedHocKy() {
    console.log('📅 Seeding Học kỳ...');
    for (const hk of hocKyData) {
        await sequelize.query(
            `INSERT IGNORE INTO HocKy (MaHK, TenHK, NamHocBatDau, NamHocKetThuc) VALUES (:MaHK, :TenHK, :NamHocBatDau, :NamHocKetThuc)`,
            { replacements: hk }
        );
    }
    console.log(`   ✅ Đã tạo xong ${hocKyData.length} Học kỳ (2022-2026)`);
}

async function seedMonHoc() {
    console.log('📖 Seeding Môn học...');
    let count = 0;
    for (const m of allMonHoc) {
        await sequelize.query(
            `INSERT IGNORE INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES (:MaMon, :TenMon, :SoTinChi, :SoTietLyThuyet, :SoTietThucHanh, :MaKhoa)`,
            { replacements: m }
        );
        count++;
    }
    console.log(`   ✅ Đã tạo xong ${count} Môn học`);
}

async function seedKhungCT() {
    console.log('📋 Seeding Khung chương trình...');
    let count = 0;
    for (const [maNganh, items] of Object.entries(khungCTMap)) {
        for (const item of items) {
            try {
                await sequelize.query(
                    `INSERT IGNORE INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES (:MaNganh, :MaMon, :HocKyDuKien, :LoaiMon)`,
                    { replacements: { MaNganh: maNganh, ...item } }
                );
                count++;
            } catch (e) { /* skip duplicates */ }
        }
    }
    console.log(`   ✅ Đã tạo xong ${count} dòng Khung chương trình cho 12 Ngành`);
}

async function seedQuyDinhTotNghiep() {
    console.log('🎓 Seeding Quy định tốt nghiệp...');
    for (const n of nganhData) {
        await sequelize.query(
            `INSERT IGNORE INTO QuyDinhTotNghiep (MaNganh, TongTTC, TCBatBuoc, TCTuChon, MinGPA) VALUES (:mn, 130, 100, 30, 2.0)`,
            { replacements: { mn: n.MaNganh } }
        );
    }
    console.log(`   ✅ Đã tạo xong Quy định tốt nghiệp cho 12 Ngành`);
}

async function seedGiangVien() {
    console.log('👨‍🏫 Seeding Giảng viên...');
    const passwordHash = await bcrypt.hash('123456', 10);
    for (const gv of giangVienData) {
        // Tạo UserAccount
        const [results] = await sequelize.query(
            `SELECT UserID FROM UserAccount WHERE Username = :un`, { replacements: { un: gv.MaGV } }
        );
        let userId;
        if (results.length === 0) {
            const [insertResult] = await sequelize.query(
                `INSERT INTO UserAccount (Username, PasswordHash, RoleID, IsActive, MaGV) VALUES (:un, :pw, 2, 1, :magv)`,
                { replacements: { un: gv.MaGV, pw: passwordHash, magv: gv.MaGV } }
            );
            userId = insertResult;
        } else {
            userId = results[0].UserID;
        }

        await sequelize.query(
            `INSERT IGNORE INTO GiangVien (MaGV, HoTen, GioiTinh, HocVi, MaKhoa, Email, SDT, UserID) VALUES (:MaGV, :HoTen, :GioiTinh, :HocVi, :MaKhoa, :Email, :SDT, :uid)`,
            { replacements: { ...gv, uid: userId } }
        );
    }
    console.log(`   ✅ Đã tạo xong ${giangVienData.length} Giảng viên + UserAccount`);
}

async function seedLopHanhChinh() {
    console.log('🏠 Seeding Lớp hành chính...');
    const khoas = ['22', '23']; // Khóa 22 (2022) và Khóa 23 (2023)
    const lopList = [];

    const nganhLopCodeMap = {
        KTPM: 'KTPM', HTTT: 'HTTT', KHMT: 'KHMT',
        SPTOAN: 'SPTO', SPTA: 'SPTA', SPNV: 'SPNV',
        QTKD: 'QTKD', KETOAN: 'KETO', MKT: 'MKT0',
        NH: 'NH00', CN: 'CN00', NTTS: 'NTTS',
    };

    for (const nganh of nganhData) {
        const gvPool = gvByKhoa[nganh.MaKhoa] || [];
        for (const khoa of khoas) {
            const code = nganhLopCodeMap[nganh.MaNganh] || nganh.MaNganh.substring(0,4);
            const maLop = `DH${khoa}${code}`;
            const tenLop = `${nganh.TenNganh} - Khóa 20${khoa}`;
            const nienKhoa = `20${khoa}-20${parseInt(khoa)+4}`;
            const gvcn = gvPool.length > 0 ? pick(gvPool) : 'GV001';

            lopList.push({ MaLop: maLop, TenLop: tenLop, NienKhoa: nienKhoa, MaNganh: nganh.MaNganh, MaGVCN: gvcn });
        }
    }

    for (const lop of lopList) {
        await sequelize.query(
            `INSERT IGNORE INTO LopHanhChinh (MaLop, TenLop, NienKhoa, MaNganh, MaGVCN) VALUES (:MaLop, :TenLop, :NienKhoa, :MaNganh, :MaGVCN)`,
            { replacements: lop }
        );
    }
    console.log(`   ✅ Đã tạo xong ${lopList.length} Lớp hành chính`);
    return lopList;
}

async function seedSinhVien(lopList) {
    console.log('👩‍🎓 Seeding 240 Sinh viên...');
    const passwordHash = await bcrypt.hash('123456', 10);
    const svPerLop = Math.ceil(240 / lopList.length); // ~10 SV/Lớp
    let svIndex = 1;
    const allSinhVien = [];
    let hasVoVanTy = false;

    for (const lop of lopList) {
        for (let i = 0; i < svPerLop; i++) {
            if (svIndex > 240) break;

            const maSV = `SV${String(svIndex).padStart(3, '0')}`;
            let hoTen, gioiTinh;

            // Hardcode Võ Văn Tỷ cho lớp HTTT khóa 23
            if (!hasVoVanTy && lop.MaNganh === 'HTTT' && lop.MaLop.includes('23')) {
                hoTen = 'Võ Văn Tỷ';
                gioiTinh = 'Nam';
                hasVoVanTy = true;
            } else {
                const person = randomVietnameseName();
                hoTen = person.name;
                gioiTinh = person.gender;
            }

            const ngaySinh = faker.date.birthdate({ min: 18, max: 24, mode: 'age' }).toISOString().split('T')[0];
            const cccd = `0${randInt(10, 99)}${randInt(100000000, 999999999)}`;
            const email = `${maSV.toLowerCase()}@student.edu.vn`;
            const sdt = `09${randInt(10000000, 99999999)}`;

            // Tạo UserAccount cho SV
            const [existCheck] = await sequelize.query(`SELECT UserID FROM UserAccount WHERE Username = :un`, { replacements: { un: maSV } });
            let userId;
            if (existCheck.length === 0) {
                const [insertRes] = await sequelize.query(
                    `INSERT INTO UserAccount (Username, PasswordHash, RoleID, IsActive) VALUES (:un, :pw, 3, 1)`,
                    { replacements: { un: maSV, pw: passwordHash } }
                );
                userId = insertRes;
            } else {
                userId = existCheck[0].UserID;
            }

            await sequelize.query(
                `INSERT IGNORE INTO SinhVien (MaSV, HoTen, NgaySinh, GioiTinh, CCCD, Email, SDT, MaLop, TrangThai, UserID)
                 VALUES (:MaSV, :HoTen, :NgaySinh, :GioiTinh, :CCCD, :Email, :SDT, :MaLop, :TrangThai, :UserID)`,
                { replacements: { MaSV: maSV, HoTen: hoTen, NgaySinh: ngaySinh, GioiTinh: gioiTinh, CCCD: cccd, Email: email, SDT: sdt, MaLop: lop.MaLop, TrangThai: 'Đang học', UserID: userId } }
            );

            allSinhVien.push({ MaSV: maSV, HoTen: hoTen, MaLop: lop.MaLop, MaNganh: lop.MaNganh, MaKhoa: nganhData.find(n => n.MaNganh === lop.MaNganh)?.MaKhoa });
            svIndex++;
        }
    }
    console.log(`   ✅ Đã tạo xong ${allSinhVien.length} Sinh viên (bao gồm Võ Văn Tỷ - HTTT K23)`);
    return allSinhVien;
}

async function seedLopHocPhanVaDiem(allSinhVien) {
    console.log('📊 Seeding Lớp Học Phần + Kết Quả Học Tập...');

    // Xác định HK dự kiến -> MaHK thực: khóa 22 bắt đầu HK1 (2022-2023), khóa 23 bắt đầu HK3 (2023-2024)
    const khoaStartHK = { '22': 0, '23': 2 }; // offset vào hocKyData array

    let lhpCount = 0;
    let kqCount = 0;
    const lhpCreated = {}; // key: MaMon-MaHK -> MaLHP

    // Sinh viên "Võ Văn Tỷ"
    const voVanTy = allSinhVien.find(sv => sv.HoTen === 'Võ Văn Tỷ');

    // Nhóm SV theo Lớp (cùng Ngành, cùng Khóa)
    const svByLop = {};
    allSinhVien.forEach(sv => {
        if (!svByLop[sv.MaLop]) svByLop[sv.MaLop] = [];
        svByLop[sv.MaLop].push(sv);
    });

    for (const [maLop, svList] of Object.entries(svByLop)) {
        if (svList.length === 0) continue;
        const maNganh = svList[0].MaNganh;
        const maKhoa = svList[0].MaKhoa;
        const khoaStr = maLop.substring(2, 4); // '22' or '23'
        const hkOffset = khoaStartHK[khoaStr] || 0;

        const khungCT = khungCTMap[maNganh];
        if (!khungCT) continue;

        // Chỉ tạo LHP và điểm cho HK 1-6 (để có data đủ cho thống kê, HK7-8 chưa tới)
        const maxHK = khoaStr === '22' ? 6 : 4;

        // Bypass cho SV031: được học tất cả các học kỳ
        let hasSV031 = svList.some(sv => sv.MaSV === 'SV031');

        for (const item of khungCT) {
            if (!hasSV031 && item.HocKyDuKien > maxHK) continue;

            const hkIdx = hkOffset + item.HocKyDuKien - 1;
            if (hkIdx >= hocKyData.length) continue;
            const maHK = hocKyData[hkIdx].MaHK;

            // Tạo mã LHP unique
            const lhpKey = `${item.MaMon}_${maHK}_${maNganh}`;

            let maLHP;
            if (!lhpCreated[lhpKey]) {
                lhpCount++;
                maLHP = `LHP${String(lhpCount).padStart(4, '0')}`;

                const gvPool = gvByKhoa[maKhoa] || ['GV001'];
                const maGV = pick(gvPool);
                const tenLopHP = `${item.MaMon} - ${maNganh} (${maHK})`;

                await sequelize.query(
                    `INSERT IGNORE INTO LopHocPhan (MaLHP, MaMon, MaHK, MaGV, TenLopHP, PhongHoc, SiSoToiDa, TrangThai, TrangThaiNhapDiem)
                     VALUES (:MaLHP, :MaMon, :MaHK, :MaGV, :TenLopHP, :PhongHoc, 60, 'Đã kết thúc', 'Đã chốt điểm')`,
                    { replacements: { MaLHP: maLHP, MaMon: item.MaMon, MaHK: maHK, MaGV: maGV, TenLopHP: tenLopHP, PhongHoc: pick(phongHocList) } }
                );
                lhpCreated[lhpKey] = maLHP;
            } else {
                maLHP = lhpCreated[lhpKey];
            }

            // Tạo KetQuaHocTap cho từng SV trong lớp này
            for (const sv of svList) {
                let diemGK, diemCK;
                const isVVT = voVanTy && sv.MaSV === voVanTy.MaSV;
                const isSV031 = sv.MaSV === 'SV031';

                if (isVVT || isSV031) {
                    // Điểm cao cho Võ Văn Tỷ và SV031
                    diemGK = randFloat(8.5, 10);
                    diemCK = randFloat(8.0, 10);
                } else {
                    // Random tự nhiên: ~8% F, phần lớn trung bình-khá
                    const roll = Math.random();
                    if (roll < 0.08) {
                        // Rớt
                        diemGK = randFloat(1.0, 4.5);
                        diemCK = randFloat(0.5, 3.5);
                    } else if (roll < 0.25) {
                        // Yếu-Trung bình
                        diemGK = randFloat(4.0, 6.0);
                        diemCK = randFloat(3.5, 6.0);
                    } else if (roll < 0.65) {
                        // Khá
                        diemGK = randFloat(6.0, 8.0);
                        diemCK = randFloat(5.5, 8.0);
                    } else if (roll < 0.90) {
                        // Giỏi
                        diemGK = randFloat(7.5, 9.5);
                        diemCK = randFloat(7.0, 9.5);
                    } else {
                        // Xuất sắc
                        diemGK = randFloat(9.0, 10);
                        diemCK = randFloat(8.5, 10);
                    }
                }

                diemGK = round(diemGK, 1);
                diemCK = round(diemCK, 1);
                const diemTongKet = round(diemGK * 0.4 + diemCK * 0.6, 2);
                const diemChu = quyDoiDiemChu(diemTongKet);

                try {
                    await sequelize.query(
                        `INSERT IGNORE INTO KetQuaHocTap (MaSV, MaLHP, DiemGK, DiemCK, DiemTongKet, DiemChu)
                         VALUES (:MaSV, :MaLHP, :DiemGK, :DiemCK, :DiemTongKet, :DiemChu)`,
                        { replacements: { MaSV: sv.MaSV, MaLHP: maLHP, DiemGK: diemGK, DiemCK: diemCK, DiemTongKet: diemTongKet, DiemChu: diemChu } }
                    );
                    kqCount++;
                } catch (e) { /* skip duplicate */ }
            }
        }
    }

    console.log(`   ✅ Đã tạo xong ${lhpCount} Lớp Học Phần`);
    console.log(`   ✅ Đã tạo xong ${kqCount} Kết Quả Học Tập (bao gồm ~8% rớt môn)`);
}

async function seedAdminAccount() {
    console.log('🔑 Seeding Admin Account...');
    const passwordHash = await bcrypt.hash('admin123', 10);
    const [existCheck] = await sequelize.query(`SELECT UserID FROM UserAccount WHERE Username = 'admin'`);
    if (existCheck.length === 0) {
        await sequelize.query(
            `INSERT INTO UserAccount (Username, PasswordHash, RoleID, IsActive) VALUES ('admin', :pw, 1, 1)`,
            { replacements: { pw: passwordHash } }
        );
    }
    console.log('   ✅ Đã tạo tài khoản Admin (admin / admin123)');
}

// ========== MAIN ==========
async function main() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║    🌱 SEED DATABASE - HỆ THỐNG QUẢN LÝ ĐIỂM SV 🌱    ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');

    try {
        await sequelize.authenticate();
        console.log('✅ Kết nối MySQL thành công!\n');

        // Hỏi xác nhận
        console.log('⚠️  Script này sẽ THÊM dữ liệu mẫu vào CSDL hiện có.');
        console.log('   Đảm bảo CSDL đã có các bảng (chạy Sequelize sync trước).\n');

        await seedRoles();
        await seedKhoaNganh();
        await seedHocKy();
        await seedMonHoc();
        await seedKhungCT();
        await seedQuyDinhTotNghiep();
        await seedGiangVien();
        await seedAdminAccount();

        const lopList = await seedLopHanhChinh();
        const allSV = await seedSinhVien(lopList);
        await seedLopHocPhanVaDiem(allSV);

        console.log('\n╔══════════════════════════════════════════════════════════╗');
        console.log('║    🎉 HOÀN TẤT SEED DATABASE THÀNH CÔNG! 🎉            ║');
        console.log('╠══════════════════════════════════════════════════════════╣');
        console.log('║  📊 Tóm tắt:                                           ║');
        console.log('║  • 4 Khoa | 12 Ngành | 8 Học kỳ                        ║');
        console.log('║  • ~90 Môn học | 12 Khung CT                           ║');
        console.log('║  • 15 Giảng viên | 24 Lớp hành chính                   ║');
        console.log('║  • 240 Sinh viên (có Võ Văn Tỷ - HTTT)                 ║');
        console.log('║  • Hàng nghìn dòng Kết Quả Học Tập (~8% rớt)           ║');
        console.log('║                                                         ║');
        console.log('║  🔑 Tài khoản mẫu:                                     ║');
        console.log('║  • Admin: admin / admin123                              ║');
        console.log('║  • GV:    GV001-GV015 / 123456                          ║');
        console.log('║  • SV:    SV001-SV240 / 123456                          ║');
        console.log('╚══════════════════════════════════════════════════════════╝');

    } catch (error) {
        console.error('\n❌ LỖI SEED:', error.message);
        console.error(error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

main();

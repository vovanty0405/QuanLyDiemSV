const sequelize = require('../config/database');

const Role = require('./Role');
const UserAccount = require('./UserAccount');
const Khoa = require('./Khoa');
const HocKy = require('./HocKy');
const ThongBao = require('./ThongBao');
const NhatKyHoatDong = require('./NhatKyHoatDong');
const Nganh = require('./Nganh');
const GiangVien = require('./GiangVien');
const MonHoc = require('./MonHoc');
const DieuKienMonHoc = require('./DieuKienMonHoc');
const KhungChuongTrinh = require('./KhungChuongTrinh');
const LopHanhChinh = require('./LopHanhChinh');
const SinhVien = require('./SinhVien');
const LopHocPhan = require('./LopHocPhan');
const KetQuaHocTap = require('./KetQuaHocTap');
const DonKhieuNai = require('./DonKhieuNai');
const Session = require('./Session');
const ChucNang = require('./ChucNang');
const HanhDong = require('./HanhDong');
const PhanQuyen = require('./PhanQuyen');
const PhanQuyenPhamVi = require('./PhanQuyenPhamVi');
const QuyDinhTotNghiep = require('./QuyDinhTotNghiep');

// ==============================================
// ĐỊNH NGHĨA QUAN HỆ (ASSOCIATIONS)
// ==============================================

// UserAccount - Role (N-1)
Role.hasMany(UserAccount, { foreignKey: 'RoleID' });
UserAccount.belongsTo(Role, { foreignKey: 'RoleID' });

// Role - PhanQuyenPhamVi (1-N)
Role.hasMany(PhanQuyenPhamVi, { foreignKey: 'RoleID' });
PhanQuyenPhamVi.belongsTo(Role, { foreignKey: 'RoleID' });

// Role - PhanQuyen - ChucNang - HanhDong
Role.hasMany(PhanQuyen, { foreignKey: 'RoleID' });
PhanQuyen.belongsTo(Role, { foreignKey: 'RoleID' });

ChucNang.hasMany(PhanQuyen, { foreignKey: 'MaChucNang' });
PhanQuyen.belongsTo(ChucNang, { foreignKey: 'MaChucNang' });

HanhDong.hasMany(PhanQuyen, { foreignKey: 'MaHanhDong' });
PhanQuyen.belongsTo(HanhDong, { foreignKey: 'MaHanhDong' });

// UserAccount - Session (1-N)
UserAccount.hasMany(Session, { foreignKey: 'UserID' });
Session.belongsTo(UserAccount, { foreignKey: 'UserID' });

// Nganh - Khoa (N-1)
Khoa.hasMany(Nganh, { foreignKey: 'MaKhoa' });
Nganh.belongsTo(Khoa, { foreignKey: 'MaKhoa' });

// GiangVien - Khoa (N-1)
Khoa.hasMany(GiangVien, { foreignKey: 'MaKhoa' });
GiangVien.belongsTo(Khoa, { foreignKey: 'MaKhoa' });

// GiangVien - UserAccount (1-1)
UserAccount.hasOne(GiangVien, { foreignKey: 'UserID' });
GiangVien.belongsTo(UserAccount, { foreignKey: 'UserID' });

// MonHoc - Khoa (N-1)
Khoa.hasMany(MonHoc, { foreignKey: 'MaKhoa' });
MonHoc.belongsTo(Khoa, { foreignKey: 'MaKhoa' });

// DieuKienMonHoc - MonHoc
MonHoc.hasMany(DieuKienMonHoc, { foreignKey: 'MaMon', as: 'MonHocChinh' });
DieuKienMonHoc.belongsTo(MonHoc, { foreignKey: 'MaMon', as: 'MonHocChinh' });

MonHoc.hasMany(DieuKienMonHoc, { foreignKey: 'MaMonTienQuyet', as: 'MonHocTienQuyet' });
DieuKienMonHoc.belongsTo(MonHoc, { foreignKey: 'MaMonTienQuyet', as: 'MonHocTienQuyet' });

// Nganh - KhungChuongTrinh (1-N)
Nganh.hasMany(KhungChuongTrinh, { foreignKey: 'MaNganh' });
KhungChuongTrinh.belongsTo(Nganh, { foreignKey: 'MaNganh' });

// Nganh - QuyDinhTotNghiep (1-1)
Nganh.hasOne(QuyDinhTotNghiep, { foreignKey: 'MaNganh' });
QuyDinhTotNghiep.belongsTo(Nganh, { foreignKey: 'MaNganh' });

// MonHoc - KhungChuongTrinh (1-N)
MonHoc.hasMany(KhungChuongTrinh, { foreignKey: 'MaMon' });
KhungChuongTrinh.belongsTo(MonHoc, { foreignKey: 'MaMon' });

// LopHanhChinh - Nganh & GiangVien (GVCN)
Nganh.hasMany(LopHanhChinh, { foreignKey: 'MaNganh' });
LopHanhChinh.belongsTo(Nganh, { foreignKey: 'MaNganh' });

GiangVien.hasMany(LopHanhChinh, { foreignKey: 'MaGVCN' });
LopHanhChinh.belongsTo(GiangVien, { foreignKey: 'MaGVCN' });

// SinhVien - LopHanhChinh & UserAccount
LopHanhChinh.hasMany(SinhVien, { foreignKey: 'MaLop' });
SinhVien.belongsTo(LopHanhChinh, { foreignKey: 'MaLop' });

UserAccount.hasOne(SinhVien, { foreignKey: 'UserID' });
SinhVien.belongsTo(UserAccount, { foreignKey: 'UserID' });

// LopHocPhan - MonHoc, HocKy, GiangVien
MonHoc.hasMany(LopHocPhan, { foreignKey: 'MaMon' });
LopHocPhan.belongsTo(MonHoc, { foreignKey: 'MaMon' });

HocKy.hasMany(LopHocPhan, { foreignKey: 'MaHK' });
LopHocPhan.belongsTo(HocKy, { foreignKey: 'MaHK' });

GiangVien.hasMany(LopHocPhan, { foreignKey: 'MaGV' });
LopHocPhan.belongsTo(GiangVien, { foreignKey: 'MaGV' });

// KetQuaHocTap - SinhVien & LopHocPhan
SinhVien.hasMany(KetQuaHocTap, { foreignKey: 'MaSV' });
KetQuaHocTap.belongsTo(SinhVien, { foreignKey: 'MaSV' });

LopHocPhan.hasMany(KetQuaHocTap, { foreignKey: 'MaLHP' });
KetQuaHocTap.belongsTo(LopHocPhan, { foreignKey: 'MaLHP' });

// DonKhieuNai - SinhVien & LopHocPhan
SinhVien.hasMany(DonKhieuNai, { foreignKey: 'MaSV' });
DonKhieuNai.belongsTo(SinhVien, { foreignKey: 'MaSV' });

LopHocPhan.hasMany(DonKhieuNai, { foreignKey: 'MaLHP' });
DonKhieuNai.belongsTo(LopHocPhan, { foreignKey: 'MaLHP' });

module.exports = {
    sequelize,
    Role,
    UserAccount,
    Khoa,
    HocKy,
    ThongBao,
    NhatKyHoatDong,
    Nganh,
    GiangVien,
    MonHoc,
    DieuKienMonHoc,
    KhungChuongTrinh,
    LopHanhChinh,
    SinhVien,
    LopHocPhan,
    KetQuaHocTap,
    DonKhieuNai,
    Session,
    ChucNang,
    HanhDong,
    PhanQuyen,
    PhanQuyenPhamVi,
    QuyDinhTotNghiep
};

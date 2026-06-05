-- Tạo Database và thiết lập sử dụng
CREATE DATABASE IF NOT EXISTS QuanLyDiemSV
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE QuanLyDiemSV;

-- ==============================================
-- 1. CÁC BẢNG HỆ THỐNG & ĐỘC LẬP
-- ==============================================

CREATE TABLE Role (
    RoleID INT AUTO_INCREMENT PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL,
    MoTa VARCHAR(255)
);

CREATE TABLE UserAccount (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    RoleID INT,
    IsActive BOOLEAN DEFAULT TRUE,
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    MaGV VARCHAR(20),
    CONSTRAINT FK_UserAccount_Role FOREIGN KEY (RoleID) REFERENCES Role(RoleID) ON DELETE SET NULL
);

CREATE TABLE Khoa (
    MaKhoa VARCHAR(20) PRIMARY KEY,
    TenKhoa VARCHAR(255) NOT NULL,
    NgayThanhLap DATE,
    TruongKhoa VARCHAR(100)
);

CREATE TABLE HocKy (
    MaHK VARCHAR(20) PRIMARY KEY,
    TenHK VARCHAR(50) NOT NULL,
    NamHocBatDau INT NOT NULL,
    NamHocKetThuc INT NOT NULL
);

CREATE TABLE ThongBao (
    MaThongBao INT AUTO_INCREMENT PRIMARY KEY,
    MaNguoiGui VARCHAR(20),
    MaNguoiNhan VARCHAR(20),
    TieuDe VARCHAR(255),
    NoiDung TEXT,
    LoaiThongBao VARCHAR(50),
    ThamChieuID VARCHAR(50),
    NgayGui DATETIME DEFAULT CURRENT_TIMESTAMP,
    DaDoc BOOLEAN DEFAULT FALSE
);

CREATE TABLE NhatKyHoatDong (
    MaLog INT AUTO_INCREMENT PRIMARY KEY,
    NguoiDung VARCHAR(100),
    ThoiGian DATETIME DEFAULT CURRENT_TIMESTAMP,
    HanhDong VARCHAR(255),
    ChiTiet TEXT
);

-- ==============================================
-- 2. CÁC BẢNG CƠ CẤU (NGÀNH, MÔN HỌC, GIẢNG VIÊN)
-- ==============================================

CREATE TABLE Nganh (
    MaNganh VARCHAR(20) PRIMARY KEY,
    TenNganh VARCHAR(255) NOT NULL,
    MaKhoa VARCHAR(20),
    CONSTRAINT FK_Nganh_Khoa FOREIGN KEY (MaKhoa) REFERENCES Khoa(MaKhoa) ON DELETE CASCADE
);

CREATE TABLE GiangVien (
    MaGV VARCHAR(20) PRIMARY KEY,
    HoTen VARCHAR(255) NOT NULL,
    NgaySinh DATE,
    GioiTinh VARCHAR(10),
    Email VARCHAR(255),
    SDT VARCHAR(20),
    HocVi VARCHAR(100),
    MaKhoa VARCHAR(20),
    UserID INT,
    CCCD VARCHAR(20),
    CONSTRAINT FK_GiangVien_Khoa FOREIGN KEY (MaKhoa) REFERENCES Khoa(MaKhoa) ON DELETE SET NULL,
    CONSTRAINT FK_GiangVien_User FOREIGN KEY (UserID) REFERENCES UserAccount(UserID) ON DELETE SET NULL
);

CREATE TABLE MonHoc (
    MaMon VARCHAR(20) PRIMARY KEY,
    TenMon VARCHAR(255) NOT NULL,
    SoTinChi INT NOT NULL,
    SoTietLyThuyet INT,
    SoTietThucHanh INT,
    MaKhoa VARCHAR(20),
    CONSTRAINT FK_MonHoc_Khoa FOREIGN KEY (MaKhoa) REFERENCES Khoa(MaKhoa) ON DELETE SET NULL
);

CREATE TABLE DieuKienMonHoc (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    MaMon VARCHAR(20),
    MaMonTienQuyet VARCHAR(20),
    CONSTRAINT FK_DKMH_MonHoc FOREIGN KEY (MaMon) REFERENCES MonHoc(MaMon) ON DELETE CASCADE,
    CONSTRAINT FK_DKMH_MonTienQuyet FOREIGN KEY (MaMonTienQuyet) REFERENCES MonHoc(MaMon) ON DELETE CASCADE
);

-- ==============================================
-- BỔ SUNG: BẢNG KHUNG CHƯƠNG TRÌNH (Dựa trên image_a111be.png)
-- ==============================================
CREATE TABLE KhungChuongTrinh (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    MaNganh VARCHAR(20) NOT NULL,
    MaMon VARCHAR(20) NOT NULL,
    HocKyDuKien INT NOT NULL,
    LoaiMon VARCHAR(50) NOT NULL, -- Dùng VARCHAR thay cho NVARCHAR trong MySQL
    CONSTRAINT FK_KhungCT_Nganh FOREIGN KEY (MaNganh) REFERENCES Nganh(MaNganh) ON DELETE CASCADE,
    CONSTRAINT FK_KhungCT_MonHoc FOREIGN KEY (MaMon) REFERENCES MonHoc(MaMon) ON DELETE CASCADE,
    CONSTRAINT UQ_KhungCT_Nganh_Mon UNIQUE (MaNganh, MaMon) -- Khóa unique tránh trùng lặp môn trong một ngành
);

-- ==============================================
-- 3. CÁC BẢNG LỚP HỌC & SINH VIÊN
-- ==============================================

CREATE TABLE LopHanhChinh (
    MaLop VARCHAR(20) PRIMARY KEY,
    TenLop VARCHAR(255) NOT NULL,
    NienKhoa VARCHAR(50),
    MaNganh VARCHAR(20),
    MaGVCN VARCHAR(20),
    CONSTRAINT FK_LopHC_Nganh FOREIGN KEY (MaNganh) REFERENCES Nganh(MaNganh) ON DELETE SET NULL,
    CONSTRAINT FK_LopHC_GiangVien FOREIGN KEY (MaGVCN) REFERENCES GiangVien(MaGV) ON DELETE SET NULL
);

CREATE TABLE SinhVien (
    MaSV VARCHAR(20) PRIMARY KEY,
    HoTen VARCHAR(255) NOT NULL,
    NgaySinh DATE,
    GioiTinh VARCHAR(10),
    DiaChi VARCHAR(255),
    CCCD VARCHAR(20),
    Email VARCHAR(255),
    SDT VARCHAR(20),
    MaLop VARCHAR(20),
    TrangThai VARCHAR(50),
    UserID INT,
    CONSTRAINT FK_SinhVien_LopHC FOREIGN KEY (MaLop) REFERENCES LopHanhChinh(MaLop) ON DELETE SET NULL,
    CONSTRAINT FK_SinhVien_User FOREIGN KEY (UserID) REFERENCES UserAccount(UserID) ON DELETE SET NULL
);

CREATE TABLE LopHocPhan (
    MaLHP VARCHAR(20) PRIMARY KEY,
    MaMon VARCHAR(20),
    MaHK VARCHAR(20),
    MaGV VARCHAR(20),
    TenLopHP VARCHAR(255),
    PhongHoc VARCHAR(50),
    SiSoToiDa INT,
    TrangThai VARCHAR(50),
    CONSTRAINT FK_LopHP_MonHoc FOREIGN KEY (MaMon) REFERENCES MonHoc(MaMon) ON DELETE CASCADE,
    CONSTRAINT FK_LopHP_HocKy FOREIGN KEY (MaHK) REFERENCES HocKy(MaHK) ON DELETE CASCADE,
    CONSTRAINT FK_LopHP_GiangVien FOREIGN KEY (MaGV) REFERENCES GiangVien(MaGV) ON DELETE SET NULL
);

-- ==============================================
-- 4. CÁC BẢNG NGHIỆP VỤ (ĐIỂM, KHIẾU NẠI)
-- ==============================================

CREATE TABLE KetQuaHocTap (
    MaKQ INT AUTO_INCREMENT PRIMARY KEY,
    MaSV VARCHAR(20),
    MaLHP VARCHAR(20),
    DiemCC FLOAT,
    DiemGK FLOAT,
    DiemCK FLOAT,
    DiemChu VARCHAR(5),
    GhiChu VARCHAR(255),
    DiemThiLan1 FLOAT,
    DiemThiLan2 FLOAT,
    DiemTongKet FLOAT,
    CONSTRAINT FK_KQHT_SinhVien FOREIGN KEY (MaSV) REFERENCES SinhVien(MaSV) ON DELETE CASCADE,
    CONSTRAINT FK_KQHT_LopHP FOREIGN KEY (MaLHP) REFERENCES LopHocPhan(MaLHP) ON DELETE CASCADE
);

CREATE TABLE DonKhieuNai (
    MaKN INT AUTO_INCREMENT PRIMARY KEY,
    MaSV VARCHAR(20),
    MaLHP VARCHAR(20),
    LyDo TEXT,
    NgayGui DATETIME DEFAULT CURRENT_TIMESTAMP,
    TrangThai VARCHAR(50),
    PhanHoi TEXT,
    DaXem BOOLEAN DEFAULT FALSE,
    CONSTRAINT FK_KhieuNai_SinhVien FOREIGN KEY (MaSV) REFERENCES SinhVien(MaSV) ON DELETE CASCADE,
    CONSTRAINT FK_KhieuNai_LopHP FOREIGN KEY (MaLHP) REFERENCES LopHocPhan(MaLHP) ON DELETE CASCADE
);
USE quanlydiemsv;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE KetQuaHocTap;
TRUNCATE TABLE LopHocPhan;
TRUNCATE TABLE SinhVien;
TRUNCATE TABLE LopHanhChinh;
TRUNCATE TABLE KhungChuongTrinh;
TRUNCATE TABLE DieuKienMonHoc;
TRUNCATE TABLE MonHoc;
TRUNCATE TABLE GiangVien;
TRUNCATE TABLE Nganh;
TRUNCATE TABLE Khoa;
TRUNCATE TABLE UserAccount;
TRUNCATE TABLE Role;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Thêm Role
INSERT INTO Role (RoleID, RoleName, MoTa) VALUES
(1, 'Admin', 'Quản trị viên hệ thống'),
(2, 'GiangVien', 'Giảng viên'),
(3, 'SinhVien', 'Sinh viên');

-- 2. Thêm UserAccount (Admin: admin123, GV/SV: 123456)
-- Bảng này có thuộc tính NgayTao trong Database.sql
INSERT INTO UserAccount (UserID, Username, PasswordHash, RoleID, IsActive, NgayTao) VALUES
(1, 'admin', '$2b$10$99p.Ml6AGtRwJ9W1Jqn.PO3.ArytC/.hGGiGJDPIzBgtI2/UBPJOG', 1, 1, NOW()),
(2, 'GV001', '$2b$10$FmKMK00bwzI9R9SJsetgTepPJCYPbrlurubWQYdKnR4bD3/ik7oie', 2, 1, NOW()),
(3, 'GV002', '$2b$10$FmKMK00bwzI9R9SJsetgTepPJCYPbrlurubWQYdKnR4bD3/ik7oie', 2, 1, NOW()),
(4, 'SV001', '$2b$10$FmKMK00bwzI9R9SJsetgTepPJCYPbrlurubWQYdKnR4bD3/ik7oie', 3, 1, NOW()),
(5, 'SV002', '$2b$10$FmKMK00bwzI9R9SJsetgTepPJCYPbrlurubWQYdKnR4bD3/ik7oie', 3, 1, NOW());

-- 3. Thêm Khoa
INSERT INTO Khoa (MaKhoa, TenKhoa, NgayThanhLap, TruongKhoa) VALUES
('CNTT', 'Công nghệ thông tin', '2000-01-01', 'TS. Nguyễn Văn A'),
('KT', 'Kinh tế', '2005-01-01', 'PGS.TS Lê Thị B'),
('NN', 'Ngoại ngữ', '2010-01-01', 'ThS. Trần Văn C');

-- 4. Thêm Ngành
INSERT INTO Nganh (MaNganh, TenNganh, MaKhoa) VALUES
('KTPM', 'Kỹ thuật phần mềm', 'CNTT'),
('HTTT', 'Hệ thống thông tin', 'CNTT'),
('QTKD', 'Quản trị kinh doanh', 'KT'),
('NNA', 'Ngôn ngữ Anh', 'NN');

-- 5. Thêm Giảng viên
INSERT INTO GiangVien (MaGV, HoTen, NgaySinh, GioiTinh, Email, SDT, HocVi, MaKhoa, UserID, CCCD) VALUES
('GV001', 'Nguyễn Văn A', '1980-01-01', 'Nam', 'nva@edu.vn', '0901234567', 'Tiến sĩ', 'CNTT', 2, '001080123456'),
('GV002', 'Lê Thị B', '1985-02-02', 'Nữ', 'ltb@edu.vn', '0901234568', 'Thạc sĩ', 'KT', 3, '001085123457');

-- Cập nhật lại MaGV cho UserAccount
UPDATE UserAccount SET MaGV = 'GV001' WHERE UserID = 2;
UPDATE UserAccount SET MaGV = 'GV002' WHERE UserID = 3;

-- 6. Thêm Lớp Hành Chính
INSERT INTO LopHanhChinh (MaLop, TenLop, NienKhoa, MaNganh, MaGVCN) VALUES
('SE1501', 'Kỹ thuật phần mềm K15', '2021-2025', 'KTPM', 'GV001'),
('BA1501', 'Quản trị kinh doanh K15', '2021-2025', 'QTKD', 'GV002');

-- 7. Thêm Sinh viên
INSERT INTO SinhVien (MaSV, HoTen, NgaySinh, GioiTinh, DiaChi, CCCD, Email, SDT, MaLop, TrangThai, UserID) VALUES
('SV001', 'Trần Văn D', '2003-01-01', 'Nam', 'Hà Nội', '001203123456', 'sv001@edu.vn', '0901112223', 'SE1501', 'Đang học', 4),
('SV002', 'Phạm Thị E', '2003-05-15', 'Nữ', 'Hải Phòng', '001203123457', 'sv002@edu.vn', '0901112224', 'BA1501', 'Đang học', 5);

-- 8. Thêm Môn Học
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES
('CSDL', 'Cơ sở dữ liệu', 3, 30, 30, 'CNTT'),
('KTLT', 'Kỹ thuật lập trình', 3, 30, 30, 'CNTT'),
('TACB', 'Tiếng Anh cơ bản', 3, 45, 0, 'NN');

-- 9. Thêm Học Kỳ
INSERT INTO HocKy (MaHK, TenHK, NamHocBatDau, NamHocKetThuc) VALUES
('HK1_2023', 'Học kỳ 1', 2023, 2024),
('HK2_2023', 'Học kỳ 2', 2023, 2024);

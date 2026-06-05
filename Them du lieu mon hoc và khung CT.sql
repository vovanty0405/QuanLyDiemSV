USE QLDSV_;
GO

-- Xóa các bảng con phụ thuộc
DELETE FROM KetQuaHocTap;
DELETE FROM DonKhieuNai;
DELETE FROM YeuCauSuaDiem;
DELETE FROM LopHocPhan;
DELETE FROM KhungChuongTrinh;
DELETE FROM DieuKienMonHoc; -- Sửa lỗi FK_DieuKienMonHoc_MonHoc_MaMonTienQuyet
DELETE FROM MonHoc;
GO

-- Xóa khóa ngoại trỏ tới LopHocPhan trước khi DROP
IF OBJECT_ID('FK_KetQuaHocTap_LopHocPhan', 'F') IS NOT NULL ALTER TABLE KetQuaHocTap DROP CONSTRAINT FK_KetQuaHocTap_LopHocPhan;
IF OBJECT_ID('FK_YeuCauSuaDiem_LopHocPhan', 'F') IS NOT NULL ALTER TABLE YeuCauSuaDiem DROP CONSTRAINT FK_YeuCauSuaDiem_LopHocPhan;
IF OBJECT_ID('FK_DonKhieuNai_LopHocPhan', 'F') IS NOT NULL ALTER TABLE DonKhieuNai DROP CONSTRAINT FK_DonKhieuNai_LopHocPhan;
GO

-- Tạo lại bảng LopHocPhan có IDENTITY
DROP TABLE IF EXISTS LopHocPhan;
CREATE TABLE LopHocPhan (
    MaLHP INT IDENTITY(1,1) PRIMARY KEY,
    MaMon VARCHAR(20) NOT NULL,
    MaHK VARCHAR(10) NOT NULL,
    MaGV VARCHAR(20) NOT NULL,
    TenLopHP NVARCHAR(100),
    PhongHoc NVARCHAR(50),
    SiSoToiDa INT DEFAULT 60,
    TrangThai INT DEFAULT 0,
    CONSTRAINT FK_LopHocPhan_MonHoc FOREIGN KEY (MaMon) REFERENCES MonHoc(MaMon),
    CONSTRAINT FK_LopHocPhan_HocKy FOREIGN KEY (MaHK) REFERENCES HocKy(MaHK),
    CONSTRAINT FK_LopHocPhan_GiangVien FOREIGN KEY (MaGV) REFERENCES GiangVien(MaGV)
);
GO

INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS104', N'Giới thiệu ngành - ĐH CNTT', 1, 1, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('ENG110', N'Tiếng Anh 1', 4, 4, 0, NULL);
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('MAT104', N'Toán A1', 3, 3, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PHY109', N'Vật lý đại cương - TH', 4, 3, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS106', N'Lập trình căn bản', 4, 2, 2, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS107', N'Nền tảng Công nghệ thông tin', 2, 1, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PHI104', N'Triết học Mác - Lênin', 3, 3, 0, NULL);
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('ENG111', N'Tiếng Anh 2', 4, 4, 0, NULL);
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PHT110', N'Giáo dục thể chất 1 (*)', 1, 0, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('MIS150', N'Giáo dục quốc phòng - an ninh 1 (*)', 3, 0, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('MAT105', N'Toán A2', 3, 3, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('MAT503', N'Toán rời rạc', 2, 2, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS108', N'Ngôn ngữ lập trình Java', 3, 1, 2, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS304', N'Cấu trúc dữ liệu', 3, 2, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('CON301', N'Mạng máy tính', 2, 2, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('MAX309', N'Kinh tế chính trị Mác - Lênin', 2, 2, 0, NULL);
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('ENG302', N'Tiếng Anh 3', 4, 4, 0, NULL);
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PHT121', N'Giáo dục thể chất 2 (*)', 2, 0, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('MIS160', N'Giáo dục quốc phòng - an ninh 2 (*)', 2, 0, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('MAT106', N'Toán A3', 3, 3, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS330', N'Kiến trúc máy tính và Hợp ngữ', 3, 2, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS311', N'Cơ sở dữ liệu', 3, 2, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS313', N'Phương pháp lập trình hướng đối tượng', 3, 2, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS303', N'Phương pháp tính - TH', 2, 2, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('LNP101', N'Quy hoạch tuyến tính', 2, 2, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS334', N'Lý thuyết thông tin', 2, 2, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('MAX310', N'Chủ nghĩa xã hội khoa học', 2, 2, 0, NULL);
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('MIS170', N'Giáo dục quốc phòng - an ninh 3 (*)', 3, 0, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PRS302', N'Xác suất thống kê A - TH', 3, 2, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('ESP305', N'Tiếng Anh chuyên ngành TH', 2, 2, 0, NULL);
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('SEE301', N'Nhập môn công nghệ phần mềm', 2, 1, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS309', N'Phân tích và thiết kế giải thuật', 3, 3, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS310', N'Nguyên lý hệ điều hành', 3, 2, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS324', N'Kỹ thuật soạn thảo văn bản - TH', 2, 1, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS326', N'Kỹ năng giao tiếp ngành nghề', 2, 2, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('VRP505', N'Lịch sử Đảng Cộng sản Việt Nam', 2, 2, 0, NULL);
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS503', N'Lý thuyết đồ thị', 3, 3, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('TIE501', N'Lập trình .NET', 4, 2, 2, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('IMS302', N'Phân tích thiết kế hệ thống thông tin', 3, 2, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('CON503', N'Quản trị mạng', 3, 2, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('IMS912', N'Chuyên đề Java', 3, 1, 2, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS316', N'Đồ hoạ máy tính', 3, 2, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS525', N'Chuyên đề Python', 3, 2, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('HCM101', N'Tư tưởng Hồ Chí Minh', 2, 2, 0, NULL);
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('IMS301', N'Nguyên lý hệ quản trị CSDL', 3, 2, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('IMS501', N'Lập trình quản lý', 3, 1, 2, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('CON501', N'Lập trình Web', 3, 1, 2, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('SEE505', N'Phân tích và thiết kế phần mềm hướng đối tượng', 3, 2, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('SEE910', N'Điện toán đám mây', 3, 2, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('CON502', N'Lập trình cho các thiết bị di động', 3, 2, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS508', N'Xử lý ảnh', 3, 2, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('MOR303', N'Phương pháp nghiên cứu khoa học - TH', 2, 2, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS521', N'Trí tuệ nhân tạo', 3, 2, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('SEE508', N'Quản lý dự án phần mềm', 2, 2, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('CON915', N'Thiết kế và cài đặt mạng', 2, 1, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('SEE518', N'Công nghệ Web - PHP', 3, 1, 2, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('SEE517', N'Công nghệ Web - ASP.NET', 3, 1, 2, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('TIE903', N'Thực tập cuối khóa - TH', 5, 0, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('TIE913', N'Khóa luận tốt nghiệp - TH', 10, 0, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('CON914', N'Lập trình truyền thông', 2, 1, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('SEE504', N'Phát triển phần mềm mã nguồn mở', 2, 1, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('BUS528', N'Thương mại điện tử - TH', 2, 1, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('CON512', N'Lập trình cho các thiết bị di động nâng cao', 3, 2, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('IMS504', N'Phát triển hệ thống thông tin quản lý', 3, 2, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('IMS914', N'Hệ quản trị CSDL Oracle', 3, 2, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS515', N'Khai khoáng dữ liệu', 3, 2, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS912', N'Chuyên đề Blockchain', 3, 2, 1, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa = 'CNTT' OR TenKhoa LIKE N'%Công nghệ thông tin%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('EDU126', N'Giới thiệu ngành - SP Toán học', 2, 30, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('MAX101', N'Những nguyên lý cơ bản của chủ nghĩa Mác - Lênin 1', 2, 22, 16, NULL);
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('EDU103', N'Quản lý hành chính Nhà nước và Quản lý ngành giáo dục và đào tạo', 2, 30, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PSY101', N'Tâm lý học đại cương', 2, 30, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PED117', N'Giáo dục học', 3, 45, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('CAL101', N'Giải tích 1', 4, 60, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('MAX102', N'Những nguyên lý cơ bản của chủ nghĩa Mác - Lênin 2', 3, 32, 26, NULL);
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PSY106', N'Tâm lý học sư phạm cho giáo viên THCS và THPT', 4, 60, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('ALG113', N'Đại số tuyến tính', 5, 75, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('CAL102', N'Giải tích 2', 5, 75, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('ENG101', N'Tiếng Anh 1 (*)', 3, 45, 0, NULL);
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('FSL101', N'Tiếng Pháp 1 (*)', 3, 45, 0, NULL);
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('CHI101', N'Tiếng Trung 1 (*)', 3, 45, 0, NULL);
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COS101', N'Tin học đại cương (*)', 3, 25, 40, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PED543', N'Lý luận dạy học môn Toán', 4, 45, 30, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('ALG503', N'Đại số đại cương 1', 3, 45, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('ALG510', N'Đại số sơ cấp', 3, 45, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('GEM504', N'Hình học sơ cấp', 3, 45, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PED317', N'Thực hành nghề nghiệp 1', 2, 15, 30, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('ENG102', N'Tiếng Anh 2 (*)', 4, 60, 0, NULL);
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('FSL102', N'Tiếng Pháp 2 (*)', 4, 60, 0, NULL);
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('CHI102', N'Tiếng Trung 2 (*)', 4, 60, 0, NULL);
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('VRP101', N'Đường lối Cách mạng của Đảng Cộng sản Việt Nam', 3, 32, 26, NULL);
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PED112', N'Phương pháp nghiên cứu khoa học', 2, 30, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PED628', N'Phương pháp dạy học Đại số và Giải tích', 3, 30, 30, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PED631', N'Phương pháp kiểm tra đánh giá trong dạy học Toán ở trường THPT', 3, 30, 30, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('ALG504', N'Đại số đại cương 2', 3, 45, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('CAL511', N'Độ đo tích phân', 3, 45, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('CAL512', N'Topo đại cương', 2, 30, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('COA304', N'Tin học chuyên ngành', 3, 15, 60, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PED629', N'Phương pháp dạy học Hình học', 3, 30, 30, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('GEM508', N'Hình học cao cấp', 5, 75, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PRS104', N'Xác suất thống kê', 4, 60, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('EDU512', N'Thực tập sư phạm 1 - SP Toán học', 2, 0, 60, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('ESP308', N'Tiếng Anh chuyên ngành - SP Toán học', 3, 45, 0, NULL);
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PED654', N'Phát triển kỹ năng nghề nghiệp - SP Toán hoc', 2, 30, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('ALG512', N'Lý thuyết Số', 3, 45, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('CAL505', N'Phương trình vi phân', 3, 45, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('CAL507', N'Giải tích hàm', 3, 45, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('GEM506', N'Hình học phi Euclide', 2, 30, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('GEM505', N'Hình vi phân', 2, 30, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PED671', N'Phương pháp giảng dạy Xác suất thống kê', 2, 20, 20, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PED682', N'Rèn luyện nghiệp vụ sư phạm - SP Toán hoc', 3, 20, 50, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PED662', N'Giáo viên trong thế kỷ XXI - SP Toán học', 2, 20, 20, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('ALG509', N'Lý thuyết Galois', 2, 30, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('ALG301', N'Lý thuyết Mô-đun', 2, 30, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('CAL510', N'Hàm biến phức', 3, 45, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('MAT504', N'Phương pháp tính', 2, 30, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('LNP102', N'Quy hoạch tuyến tính', 2, 30, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PHY532', N'Ứng dụng Toán học trong Vật lý', 2, 30, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('MAT510', N'Ứng dụng Toán học trong khoa học tự nhiên', 2, 30, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PED318', N'Thực hành nghề nghiệp 2', 2, 15, 30, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('EDU812', N'Thực tập sư phạm 2 - SP Toán học', 5, 0, 150, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('EDU945', N'Khóa luận tốt nghiệp - SP Toán học', 10, 0, 300, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('CAL910', N'Phương trình đạo hàm riêng', 3, 45, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('CAL508', N'Giải tích đa trị', 2, 30, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('MAT501', N'Lịch sử Toán', 2, 30, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('PED554', N'Rèn luyện tư duy logic cho học sinh qua giải Toán', 2, 30, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('MAT502', N'Toán rời rạc', 2, 30, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('CAL911', N'Nhập môn đa tạp khả vi', 3, 45, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
INSERT INTO MonHoc (MaMon, TenMon, SoTinChi, SoTietLyThuyet, SoTietThucHanh, MaKhoa) VALUES ('ALG507', N'Lý thuyết nhóm', 3, 45, 0, (SELECT TOP 1 MaKhoa FROM Khoa WHERE MaKhoa LIKE '%SP%' OR TenKhoa LIKE N'%Sư phạm%'));
GO

INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'COS104', 1, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'ENG110', 1, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'MAT104', 1, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'PHY109', 1, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'COS106', 1, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'COS107', 1, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'PHI104', 2, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'ENG111', 2, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'PHT110', 2, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'MIS150', 2, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'MAT105', 2, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'MAT503', 2, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'COS108', 2, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'COS304', 2, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'CON301', 2, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'MAX309', 3, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'ENG302', 3, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'PHT121', 3, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'MIS160', 3, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'MAT106', 3, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'COS330', 3, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'COS311', 3, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'COS313', 3, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'COS303', 3, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'LNP101', 3, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'COS334', 3, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'MAX310', 4, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'MIS170', 4, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'PRS302', 4, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'ESP305', 4, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'SEE301', 4, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'COS309', 4, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'COS310', 4, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'COS324', 4, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'COS326', 4, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'VRP505', 5, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'COS503', 5, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'TIE501', 5, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'IMS302', 5, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'CON503', 5, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'IMS912', 5, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'COS316', 5, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'COS525', 5, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'HCM101', 6, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'IMS301', 6, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'IMS501', 6, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'CON501', 6, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'SEE505', 6, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'SEE910', 6, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'CON502', 6, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'COS508', 6, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'MOR303', 7, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'COS521', 7, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'SEE508', 7, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'CON915', 7, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'SEE518', 7, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'SEE517', 7, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'TIE903', 8, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'TIE913', 8, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'CON914', 8, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'SEE504', 8, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'BUS528', 8, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'CON512', 8, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'IMS504', 8, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'IMS914', 8, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'COS515', 8, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('HTTT', 'COS912', 8, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'EDU126', 1, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'MAX101', 1, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'EDU103', 1, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'PSY101', 1, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'PED117', 1, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'CAL101', 1, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'MAX102', 2, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'PSY106', 2, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'ALG113', 2, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'CAL102', 2, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'ENG101', 2, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'FSL101', 2, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'CHI101', 2, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'COS101', 2, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'PHT110', 2, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'HCM101', 3, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'PED543', 3, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'ALG503', 3, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'ALG510', 3, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'GEM504', 3, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'PED317', 3, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'ENG102', 3, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'FSL102', 3, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'CHI102', 3, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'PHT121', 3, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'MIS150', 3, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'VRP101', 4, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'PED112', 4, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'PED628', 4, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'PED631', 4, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'ALG504', 4, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'CAL511', 4, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'CAL512', 4, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'MIS160', 4, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'COA304', 5, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'PED629', 5, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'GEM508', 5, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'PRS104', 5, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'EDU512', 5, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'MIS170', 5, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'ESP308', 6, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'PED654', 6, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'ALG512', 6, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'CAL505', 6, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'CAL507', 6, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'GEM506', 6, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'GEM505', 6, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'PED671', 6, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'PED682', 7, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'PED662', 7, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'ALG509', 7, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'ALG301', 7, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'CAL510', 7, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'MAT504', 7, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'LNP102', 7, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'PHY532', 7, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'MAT510', 7, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'PED318', 7, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'EDU812', 8, N'Bắt buộc');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'EDU945', 8, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'CAL910', 8, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'CAL508', 8, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'MAT501', 8, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'PED554', 8, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'MAT502', 8, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'CAL911', 8, N'Tự chọn');
INSERT INTO KhungChuongTrinh (MaNganh, MaMon, HocKyDuKien, LoaiMon) VALUES ('SPTOAN', 'ALG507', 8, N'Tự chọn');
GO

-- Phục hồi lại các khóa ngoại cho các bảng con
ALTER TABLE KetQuaHocTap ADD CONSTRAINT FK_KetQuaHocTap_LopHocPhan FOREIGN KEY (MaLHP) REFERENCES LopHocPhan(MaLHP);
ALTER TABLE YeuCauSuaDiem ADD CONSTRAINT FK_YeuCauSuaDiem_LopHocPhan FOREIGN KEY (MaLHP) REFERENCES LopHocPhan(MaLHP);
ALTER TABLE DonKhieuNai ADD CONSTRAINT FK_DonKhieuNai_LopHocPhan FOREIGN KEY (MaLHP) REFERENCES LopHocPhan(MaLHP);
GO





-- ==============================================================================
-- SCRIPT TẠO DỮ LIỆU MẪU: LỚP HỌC PHẦN (HTTT, KTPM & SPTOAN) - BẢN SỬA LỖI NULL
-- ==============================================================================

-- 1. Làm sạch dữ liệu cũ (Tùy chọn)
-- DELETE FROM LopHocPhan;

-- 2. Bảng mapping học kỳ
DECLARE @HKMapping TABLE (DuKien INT, MaReal VARCHAR(10));
INSERT INTO @HKMapping VALUES 
(1, 'HK1'), (2, 'HK2'), (3, 'HK3'), (4, 'HK4'), 
(5, 'HK5'), (6, 'HK6'), (7, 'HK7'), (8, 'HK7');

-- 3. Thêm lớp cho ngành HTTT
INSERT INTO LopHocPhan (MaMon, MaHK, MaGV, TenLopHP, PhongHoc, SiSoToiDa, TrangThai)
SELECT 
    kct.MaMon,
    COALESCE(m.MaReal, 'HK1'),
    -- Sử dụng CASE để gán Giảng viên chắc chắn không NULL
    CASE (ABS(CHECKSUM(NEWID())) % 3)
        WHEN 0 THEN 'GV001'
        WHEN 1 THEN 'GV004'
        ELSE 'GV005'
    END,
    mh.TenMon + N' (HTTT-HK' + CAST(kct.HocKyDuKien AS VARCHAR) + ')',
    'P.' + CAST(ABS(CHECKSUM(NEWID())) % 500 + 100 AS VARCHAR),
    60, 0
FROM KhungChuongTrinh kct
JOIN MonHoc mh ON kct.MaMon = mh.MaMon
LEFT JOIN @HKMapping m ON kct.HocKyDuKien = m.DuKien
WHERE kct.MaNganh = 'HTTT';

-- 4. Thêm lớp cho ngành KTPM
INSERT INTO LopHocPhan (MaMon, MaHK, MaGV, TenLopHP, PhongHoc, SiSoToiDa, TrangThai)
SELECT 
    kct.MaMon,
    COALESCE(m.MaReal, 'HK1'),
    CASE (ABS(CHECKSUM(NEWID())) % 3)
        WHEN 0 THEN 'GV001'
        WHEN 1 THEN 'GV004'
        ELSE 'GV005'
    END,
    mh.TenMon + N' (KTPM-HK' + CAST(kct.HocKyDuKien AS VARCHAR) + ')',
    'P.' + CAST(ABS(CHECKSUM(NEWID())) % 500 + 100 AS VARCHAR),
    60, 0
FROM KhungChuongTrinh kct
JOIN MonHoc mh ON kct.MaMon = mh.MaMon
LEFT JOIN @HKMapping m ON kct.HocKyDuKien = m.DuKien
WHERE kct.MaNganh = 'KTPM';

-- 5. Thêm lớp cho ngành SPTOAN
INSERT INTO LopHocPhan (MaMon, MaHK, MaGV, TenLopHP, PhongHoc, SiSoToiDa, TrangThai)
SELECT 
    kct.MaMon,
    COALESCE(m.MaReal, 'HK1'),
    'GV002', 
    mh.TenMon + N' (SPTOAN-HK' + CAST(kct.HocKyDuKien AS VARCHAR) + ')',
    'P.' + CAST(ABS(CHECKSUM(NEWID())) % 500 + 100 AS VARCHAR),
    50, 0
FROM KhungChuongTrinh kct
JOIN MonHoc mh ON kct.MaMon = mh.MaMon
LEFT JOIN @HKMapping m ON kct.HocKyDuKien = m.DuKien
WHERE kct.MaNganh = 'SPTOAN';

PRINT N'Đã hoàn tất tạo dữ liệu lớp học phần!';
GO


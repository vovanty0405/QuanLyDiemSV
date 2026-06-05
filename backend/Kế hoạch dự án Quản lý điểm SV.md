content = """# Kế Hoạch Triển Khai Dự Án: Hệ Thống Quản Lý Điểm Sinh Viên (Backend Node.js)

Dự án này được thiết kế theo chuẩn một hệ thống RESTful API chuyên nghiệp, sử dụng Node.js và MySQL. Dựa trên lược đồ cơ sở dữ liệu (ERD) bạn đang có, kế hoạch này sẽ chia nhỏ các module và đưa ra lộ trình cụ thể để bạn vừa code, vừa tích lũy điểm nhấn (highlight) cho CV ứng tuyển vị trí Intern/Fresher Backend.

## 1. Tổng Quan Kiến Trúc & Công Nghệ
* **Ngôn ngữ/Framework:** Node.js với Express.js (dễ tiếp cận, phổ biến cho fresher).
* **Database:** MySQL.
* **ORM:** Sequelize hoặc TypeORM (Khuyến nghị dùng Sequelize vì cú pháp dễ ánh xạ với các bảng trong hình như `SinhVien`, `GiangVien`, `LopHocPhan`, v.v.).
* **Authentication/Authorization:** JSON Web Token (JWT) + Bcrypt (mã hóa mật khẩu).
* **Kiến trúc thư mục:** Layered Architecture (Router -> Controller -> Service -> Model) để code clean và dễ bảo trì.

---

## 2. Lộ Trình Triển Khai

### Khởi tạo Project & Cấu hình Database
* **Mục tiêu:** Setup xong base code và ánh xạ toàn bộ ERD thành các Models trong code.
* **Công việc chi tiết:**
    1.  Khởi tạo dự án `npm init`, cài đặt các thư viện lõi (`express`, `sequelize`, `mysql2`, `dotenv`, `cors`, `helmet`).
    2.  Thiết lập cấu trúc thư mục (controllers, services, models, routes, middlewares, utils).
    3.  **Thiết kế Models dựa trên ERD:**
        * Nhóm Hệ thống: `Role`, `UserAccount`, `NhatKyHoatDong` (Logging).
        * Nhóm Cơ cấu: `Khoa`, `Nganh` (Chương trình đào tạo), `HocKy`.
        * Nhóm Người dùng: `GiangVien`, `SinhVien`.
        * Nhóm Học tập: `MonHoc`, `DieuKienMonHoc`, `LopHanhChinh`, `LopHocPhan`, `KetQuaHocTap`.
        * Nhóm Hỗ trợ: `ThongBao`, `DonKhieuNai`.
    4.  Viết script seed data (tạo sẵn Admin role, một vài môn học, khoa cơ bản) để tiện test API sau này.

###  Authentication & Phân Quyền (RBAC)
* **Mục tiêu:** Xây dựng hệ thống đăng nhập và middleware bảo vệ route.
* **Công việc chi tiết:**
    1.  Viết API `POST /api/auth/login`. Kiểm tra username/password từ bảng `UserAccount`.
    2.  Tạo Access Token bằng JWT.
    3.  Viết Middleware `verifyToken` để bắt buộc đăng nhập.
    4.  Viết Middleware `checkRole(['Admin', 'GiangVien'])` để phân quyền dựa trên `RoleID`.
    5.  Tạo cơ chế cấp tài khoản: Admin tạo tài khoản cho Giảng Viên và Sinh Viên (khi thêm mới SV/GV sẽ tự tạo `UserAccount`).

### Các Module Quản Lý Cốt Lõi (CRUD Master)
* **Mục tiêu:** Hoàn thiện API cho các danh mục không phụ thuộc nhiều vào logic phức tạp.
* **Công việc chi tiết:**
    1.  **Module Khoa & Ngành (CTĐT):** Cấu trúc cha - con.
    2.  **Module Môn Học & Học Kỳ:** Xử lý logic `DieuKienMonHoc` (Môn tiên quyết).
    3.  **Module Sinh Viên & Giảng Viên:** * API lấy danh sách có phân trang (Pagination), tìm kiếm, lọc (Filter) theo Khoa/Ngành.
        * API xem chi tiết thông tin (Profile).

###  Nghiệp vụ Lớp Học Phần & Xếp Lớp (Core Business 1)
* **Mục tiêu:** Giải quyết bài toán xếp lớp và phân công giảng dạy.
* **Công việc chi tiết:**
    1.  **Module Lớp Học Phần (LHP):** * Tạo LHP cho một Học kỳ và Môn học cụ thể.
        * Phân công Giảng Viên (`MaGV`) cho LHP.
        * Cập nhật `SiSoToiDa`, `TrangThai`.
    2.  **Logic Xếp lớp (Đăng ký học phần):**
        * API để Admin hoặc Sinh viên thêm Sinh Viên vào LHP.
        * **Ràng buộc (Validation):** Kiểm tra sĩ số tối đa, kiểm tra sinh viên đã qua môn tiên quyết chưa (dựa vào `KetQuaHocTap` và `DieuKienMonHoc`), kiểm tra trùng lịch (nếu có làm hệ thống thời khóa biểu).

### Nghiệp Vụ Quản Lý Điểm (Core Business 2)
* **Mục tiêu:** Xử lý việc nhập điểm và tính toán kết quả với 2 góc nhìn (Admin & Giảng Viên).
* **Công việc chi tiết:**
    1.  **Góc nhìn Giảng Viên:**
        * API: Lấy danh sách LHP mà Giảng viên đó đang dạy (`GET /api/giangvien/lophocphan`).
        * API: Lấy danh sách Sinh viên trong LHP để chấm điểm (`GET /api/diem/lophocphan/:id`).
        * API: Cập nhật điểm (CC, GK, CK) cho sinh viên (`PUT /api/diem/update`).
        * *Giảng viên nhập điểm sinh viên trên lưới *
    2.  **Góc nhìn Admin:**
        * Toàn quyền xem và sửa điểm của mọi LHP, mọi Học kỳ.
    3.  **Logic Tính Điểm:** * Viết Service tự động tính `DiemTongKet` và quy đổi ra `DiemChu` (A, B, C, D, F) khi cập nhật thành phần điểm.
        * *Mẹo cho CV:* Sử dụng **Database Transaction** ở đây để đảm bảo an toàn dữ liệu nếu cập nhật điểm hàng loạt.
    4. **Có ràng buộc khi nhập điểm**:  là phải nằm trong 0 - 10, không là chử, không là ký tự đặc biệt, không âm
    5. **Xử lý khi sinh viên bị học lại, học cải thiện**: Xử lý logic học vụ phức tạp: "Thi lại" và "Cải thiện" (Quy chế 6.0) 
        * Đây là một trong những thuật toán cốt lõi làm nên tính chuyên nghiệp của phần mềm (thể hiện qua hàm TinhDiemTongKetCuoiCung). Hệ thống có khả năng tự động phân luồng sinh viên thành hai nhóm đối tượng:
        * Đối với sinh viên Thi lại (điểm gốc < 6.0): Hệ thống áp dụng quy tắc khống chế nghiêm ngặt. Dù điểm thi lại đạt mức xuất sắc, thuật toán vẫn tự động chốt điểm tổng kết tối đa ở mức 6.0 (Điểm C), tuân thủ tuyệt đối quy chế tín chỉ hiện hành.
        * Đối với sinh viên Thi cải thiện (điểm gốc >= 6.0): Hệ thống thực hiện phép toán so sánh giữa điểm thi mới và điểm thi cũ, đảm bảo kết quả cuối cùng được ghi nhận luôn là mức điểm cao nhất, bảo vệ tối đa quyền lợi của người học.
    6. **Ràng buộc khi sinh viên bị cảnh cáo** 

###  Hoàn thiện tính năng phụ, Tối ưu & Đóng gói
* **Mục tiêu:** Làm cho dự án "sáng" hơn trong mắt nhà tuyển dụng.
* **Công việc chi tiết:**
    1.  **Module Đơn Khiếu Nại:** SV gửi đơn phúc khảo điểm -> GV/Admin xem và phản hồi.
    2.  **Ghi Log (NhatKyHoatDong):** Sử dụng một middleware hoặc service để ghi lại các hành động quan trọng (VD: "Giảng viên A đã sửa điểm CK của SV B từ 5 lên 7"). Đây là tính năng ghi điểm cực mạnh.
    3.  Tối ưu SQL Queries (tránh N+1 query khi dùng ORM).
    4.  Viết file `README.md` thật chuyên nghiệp (hướng dẫn cài đặt, mô tả DB, link Postman).
    5.  Deploy lên các nền tảng miễn phí (ví dụ Render) để NTD có thể test sống API của bạn.

---

## 3. Các "Điểm Chạm" (Highlights) Ghi Điểm Trong CV
Khi đi phỏng vấn hoặc viết CV, hãy nhấn mạnh các kỹ thuật sau mà bạn đã áp dụng trong dự án này:

1.  **Phân quyền (RBAC - Role Based Access Control):** Hệ thống có các Role rõ ràng, API được bảo mật bằng JWT và Middleware kiểm tra quyền hạn chặt chẽ giữa Admin và Giảng viên khi thao tác với bảng `KetQuaHocTap`.
2.  **Xử lý Logic Phức Tạp:** Đã tự thiết kế thuật toán/logic để kiểm tra "Môn học tiên quyết" (`DieuKienMonHoc`) trước khi cho phép sinh viên được xếp vào `LopHocPhan`.
3.  **Database Transaction:** Áp dụng Transaction khi thực hiện các tác vụ liên quan đến nhiều bảng cùng lúc (ví dụ: Tạo Sinh viên đồng thời tạo luôn UserAccount).
4.  **Audit Logging:** Implement chức năng `NhatKyHoatDong` giúp truy vết các thay đổi dữ liệu nhạy cảm (điểm số).
5.  **Clean Code:** Áp dụng mô hình Layered Architecture, tách biệt rõ ràng Business Logic (Service) khỏi Routing (Controller).

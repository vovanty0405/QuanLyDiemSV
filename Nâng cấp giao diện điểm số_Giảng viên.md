Đóng vai là một chuyên gia Frontend Developer (Sử dụng React/Next.js và Tailwind CSS). Hãy code module **"Nhập Điểm Giảng Viên" (Teacher Grade Entry)** cho dự án "Hệ thống Quản lý Điểm Sinh Viên".

Giao diện cần giữ nguyên logic tính năng của phiên bản cũ nhưng phải lột xác hoàn toàn theo Design System (Dark Mode) sau:
- **Background chính:** `#10131a`
- **Surface (Card/Table):** `#1d2027`
- **Border:** `#32353c`
- **Primary Action (Blue):** `#4d8eff`
- **Danger Action (Red):** `#ffb4ab` hoặc `#EF4444` (Dùng cho nút "Chốt Bảng")
- **Success Action (Green):** `#10B981` (Dùng cho nút "Lưu Bảng Điểm")
- **Text Primary:** `#e1e2ec` | **Text Muted:** `#c2c6d6`

Module gồm 2 Component View chính. Hãy dùng một state (ví dụ `selectedClass`) để chuyển đổi giữa 2 màn hình này.

---

### VIEW 1: DANH SÁCH LỚP HỌC PHẦN (Class Dashboard)
- **Top Bar:** Dropdown chọn "Học Kỳ", Ô tìm kiếm nhập từ khóa, Nút "Lọc".
- **Grid Cards (`grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6`):** Hiển thị danh sách các lớp giảng viên đang dạy.
- **Thiết kế 1 Card (Nền `#1d2027`, bo góc `rounded-lg`, viền `#32353c`, hover nâng sáng nhẹ):**
  - **Header:** Mã LHP - Tên môn học (Ví dụ: `LHP: 4 - Vật lý đại cương`). Font bold, chữ màu Primary `#4d8eff`.
  - **Body (Text muted `text-sm`):** Hiển thị các dòng: Học kỳ, Phòng học (Ví dụ: P.590), Sĩ số (Ví dụ: 60 Sinh viên).
  - **Footer (Flex box):** - Bên trái: Trạng thái (Icon chấm tròn + Text: "Đang nhập liệu" màu xanh lá hoặc "Đã chốt bảng" màu đỏ).
    - Bên phải: Nút "Nhập Điểm" (Solid Primary button). Khi click sẽ set state để chuyển sang View 2.

---

### VIEW 2: LƯỚI NHẬP ĐIỂM CHI TIẾT (Data Grid Entry)
- **Header:** Tiêu đề "Danh Sách Sinh Viên - Môn: [Tên Môn] (Mã LHP: [Mã])". Có một nút "Quay lại" (Icon ChevronLeft) góc trái trên cùng để về View 1.
- **Thanh công cụ (Toolbars):**
  - Trái: Text hiển thị "Sĩ số: X sinh viên", Dropdown "Kiểu SX" (Mã SV / Tên).
  - Phải (Actions): Nút "Lưu Bảng Điểm" (Solid Green), Nút "Nhập Excel" (Ghost/Outline), Nút "Xuất Excel" (Ghost/Outline), Nút "Chốt Bảng" (Solid Red - Hiển thị rực rỡ để cảnh báo).
- **Data Table (Lưới nhập điểm giống Excel):**
  - **Header cột (Nền `#191b23`):** STT, Mã SV, Họ Tên, Điểm CC (10%), Điểm GK (30%), Điểm CK (60%), Thi Lại L1, Thi Lại L2, Điểm Tổng Kết.
  - **Editable Cells (Ô nhập liệu):** Các cột Điểm (CC, GK, CK, Thi Lại) chứa thẻ `<input type="number" step="0.1" min="0" max="10">`.
    - UI Input: Nền màu tối `#10131a`, không viền hoặc viền cực mờ `#32353c`, text trắng. Kích thước input nhỏ gọn vừa vặn với ô bảng (`w-full h-full p-2`).
    - Focus state: Outline hoặc Ring màu Primary `#4d8eff` để người dùng biết đang nhập ô nào.
  - **Read-only Cells:** Các cột Mã SV, Họ Tên, Điểm Tổng Kết chỉ hiển thị text. Cột "Điểm Tổng Kết" tự động thay đổi khi các ô điểm thành phần thay đổi.

### Yêu cầu kỹ thuật React:
- Cấu trúc state khéo léo để quản lý mảng dữ liệu sinh viên `studentsData`, mỗi object chứa điểm thành phần.
- Viết một hàm `handleGradeChange(studentId, field, value)` để cập nhật state khi giảng viên gõ điểm.
- Đảm bảo có thể dùng phím `Tab` để di chuyển nhanh giữa các ô input liên tiếp ngang dọc như Excel.
- Dùng `lucide-react` cho các icon. Code clean, tách component rõ ràng.
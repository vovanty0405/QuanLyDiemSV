Đóng vai là một chuyên gia Frontend Developer (Sử dụng React/Next.js và Tailwind CSS). Hãy code module **"Nhập Điểm Quản Trị Viên" (Admin Grade Entry)** cho dự án Hệ thống Quản lý Điểm Sinh Viên.

Giao diện cần giữ nguyên logic tính năng từ phiên bản cũ nhưng phải tuân thủ nghiêm ngặt Design System (Dark Mode) sau:
- **Background chính:** `#10131a`
- **Surface (Card/Table):** `#1d2027`
- **Border/Hover:** `#32353c`
- **Primary Action (Blue):** `#4d8eff`
- **Success Action (Green):** `#10B981` (Dùng cho nút "Nhập Điểm", "Lưu", "Thêm")
- **Danger Action (Red):** `#ffb4ab` hoặc `#EF4444` (Dùng cho nút "Xóa")
- **Text Primary:** `#e1e2ec` | **Text Muted:** `#c2c6d6`

Module gồm 2 Component View chính, được chuyển đổi qua lại bằng state `selectedStudent`.

---

### VIEW 1: DANH SÁCH TÌM KIẾM SINH VIÊN
- **Top Bar (Bộ lọc):** - Layout Grid/Flex gồm: Select "Khoa", Select "Loại Tìm Kiếm", Input "Từ khóa" (kèm icon Kính lúp), Select "Kiểu Sắp Xếp", Radio (Tăng/Giảm). 
  - Các input/select có nền `#10131a`, viền `#32353c`, focus sáng màu Primary.
- **Data Table (Danh sách sinh viên):**
  - Header bảng nền `#191b23`, chữ uppercase màu muted.
  - Các cột: Mã SV, Họ Tên, Ngày Sinh, Giới tính, Lớp, Khoa, Trạng Thái, Thao Tác.
  - **Cột Thao Tác:** Chứa một nút "Nhập Điểm" (Solid button màu Primary `#4d8eff` hoặc Green `#10B981`, bo góc 4px). Khi click, set `selectedStudent` để chuyển sang View 2.
  - *Data mẫu:* Thêm "Võ Văn Tỷ" (DTH235801, Lớp Hệ thống thông tin, Khoa CNTT) và "Nguyễn Nhật Nam" (DTO235804, Lớp Sư phạm Toán) để test giao diện.

---

### VIEW 2: CHI TIẾT ĐIỂM CỦA MỘT SINH VIÊN
Màn hình này chia làm 3 phần chính từ trên xuống dưới:

**Phần 1: Thông tin & Form Nhập liệu (Grid Split 4-8 hoặc 3-9)**
- **Card Trái (Thông tin Sinh viên):** Nền `#1d2027`, bo góc 8px, viền `#32353c`. Hiển thị dạng Label-Value: Mã Sinh Viên (màu Primary), Họ Và Tên, Lớp, Khoa, Ngành, Cố vấn học tập.
- **Card Phải (Form Thông tin điểm):** Nền `#1d2027`, bo góc 8px.
  - Hàng 1: Select "Học Kỳ", Select/Input "Tên Môn" (Mã môn tự fill theo), Input "Số tín chỉ" (Read-only).
  - Hàng 2 & 3: Các ô input nhập điểm: Điểm quá trình (40%), Điểm cuối kỳ (60%), Điểm thi lần 1, Điểm thi lần 2. (Background input tối màu `#10131a`).
  - Hàng 4: Input "Ghi chú" (Full width).

**Phần 2: Thanh Công Cụ (Action Toolbar)**
- Một dải Flexbox chứa các nút thao tác cho Form phía trên:
  - Nút: Lưu (Icon Save), Thêm (Icon Plus - Primary), Làm lại (Icon Refresh - Ghost), Sửa (Icon Edit - Ghost), Xóa (Icon Trash - Danger).
  - Góc phải có cụm nút: Xuất File, Nhập (Excel), và "Quay lại" (Icon ArrowLeft) để về View 1.

**Phần 3: Danh sách điểm & Tổng kết (Card dưới cùng)**
- **Data Table:** Hiển thị danh sách các môn đã có điểm trong Học Kỳ đang chọn. 
  - Cột: Mã Môn, Tên Môn, TC, Đ.Quá Trình, Đ.Cuối Kỳ, Đ.Thi lần 1, Đ.Thi lần 2, TK(10), TK(CH).
  - *Interaction:* Khi click vào một dòng trong bảng này, fill dữ liệu ngược lên Form ở Phần 1 để Admin có thể "Sửa" hoặc "Xóa". Điểm TK tự động bôi màu (Ví dụ A thì xanh, F thì đỏ).
- **Tổng Kết Học Kỳ (Dưới bảng):** Hiển thị khối Text thống kê: Điểm TB Học Kỳ (hệ 10 & 4), Tổng số tín chỉ đạt, Tổng số tín chỉ tích lũy, Số môn đã có điểm, Xếp Loại Học Kỳ (màu highlight rực rỡ, ví dụ "Xuất sắc" màu `#10B981`).

### Yêu cầu kỹ thuật React:
- Viết code bằng React Functional Component.
- Khai báo rõ các state: `formData` (cho các input), `gradeList` (mảng điểm trong bảng).
- Dùng `lucide-react` cho các icon. Đảm bảo UI mượt mà, căn chỉnh padding/margin chuẩn xác.
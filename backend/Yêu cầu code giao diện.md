Đóng vai là một chuyên gia Frontend Developer (Sử dụng React/Next.js và Tailwind CSS). Hãy giúp tôi code giao diện màn hình **"Thống kê & Báo cáo" (Dashboard)** kết hợp với **Bảng dữ liệu danh sách Sinh viên** cho dự án "Hệ thống Quản lý Điểm Sinh Viên".

Dưới đây là các yêu cầu chi tiết dựa trên Design System và UI Reference của dự án:

### 1. Design System & Tokens (Cấu hình Tailwind)
Giao diện mặc định là **Dark Mode**. Hãy thiết lập các lớp màu sau trong file CSS hoặc tailwind.config.js (dựa trên DESIGN.md):
- **Background (Canvas):** `#10131a` (Background chính của trang)
- **Surface/Card:** `#1d2027` (Màu nền cho các Card, Sidebar, Table)
- **Surface Hover/Border:** `#32353c` (Dùng cho hover state hoặc viền border 1px)
- **Primary Action (Blue):** `#4d8eff` (Nút bấm chính, Active menu)
- **Text Primary:** `#e1e2ec` (Trắng sáng cho Heading, Text chính)
- **Text Secondary (Muted):** `#c2c6d6` (Xám nhạt cho text phụ, placeholder)
- **Semantic Colors:** - Success/Passing (Green): `#10B981` hoặc tương đương.
  - Error/Failing (Red): `#ffb4ab`
  - Warning (Orange): `#df7412`
- **Typography:** Font `Inter`.
- **Border Radius:** Mặc định `8px` (rounded), các Card lớn dùng `16px` (rounded-2xl), Status Pill dùng `9999px` (rounded-full).

### 2. Layout Structure (Bố cục)
Áp dụng Fixed Sidebar + Fluid Content:
- **Sidebar (Left):** Cố định width `260px`, nền `#1d2027`. Bao gồm Logo "EduFlow/GradeSys" và các menu: Trang chủ (Active), Sinh viên, Giảng viên, Lớp học, Khóa học, Điểm số, Tài khoản, Thống kê. Menu active có background xanh nhạt (opacity 10%) và viền trái 4px màu Primary.
- **Main Content (Right):** Flex-grow, nền `#10131a`. Padding xung quanh `24px`. Lưới `12-column grid` cho các widget.

### 3. Các Component cần Code trên màn hình
Hãy chia nhỏ thành các React Component. Nội dung chính từ trên xuống dưới bao gồm:

**A. Header (Top):**
- Breadcrumb: `Trang chủ > Thống kê & Báo cáo` (Text color muted).
- Tiêu đề màn hình: "Thống kê & Báo cáo" (Font bold, text lớn `30px`).
- Góc phải có 2 nút: Nút "Xuất dữ liệu" (Ghost button viền xám) và Nút "Tạo báo cáo mới" (Solid button màu Primary `#4d8eff` kèm Icon Plus).

**B. Stats Cards (Grid 4 cột):**
Tạo 4 thẻ thống kê nằm ngang nhau (nền `#1d2027`, bo góc 12px, padding 20px).
1. Tổng sinh viên: 24,512 (Kèm icon User màu xanh lá +12%)
2. GPA Trung bình: 3.42 / 4.0 (Kèm icon Star màu cam +3.2%)
3. Tỷ lệ vắng mặt: 4.8% (Kèm icon Calendar màu đỏ -1.5%)
4. Tổng tín chỉ: 128,450 (Kèm icon Book màu xám)

**C. Chart Placeholder (Grid 2 cột lớn):**
Tạo 2 khối giả lập biểu đồ (chỉ cần dựng khung div nền `#1d2027`, tiêu đề góc trái, có thể dùng div trống để làm placeholder).
- Khối trái (Chiếm 2/3): "Xu hướng GPA qua các học kỳ".
- Khối phải (Chiếm 1/3): "Xếp loại học lực" (Khung hình vuông giả lập biểu đồ tròn).

**D. Data Table (Chiếm full 12 cột) - Báo cáo chi tiết Sinh viên:**
Làm theo style bảng của Flowbite nhưng màu sắc của DESIGN.md.
- **Table Header:** Background `#191b23`, Text in hoa, size `12px` (`text-xs uppercase`), màu xám muted. Các cột: SINH VIÊN (Avatar + Tên + Email), MÃ SỐ, KHOA, GPA, TRẠNG THÁI, THAO TÁC.
- **Table Rows:** Background `#1d2027`, border-bottom 1px `#32353c`. Hover có hiệu ứng sáng nhẹ.
- **Data mẫu cho dòng 1:** Tên "Võ Văn Tỷ", Mã "SV12345", Khoa "Công nghệ thông tin", GPA `3.92` (Màu Text Primary Blue), Trạng thái "Hoạt động" (Pill nền xám, chấm tròn xanh lá), Thao tác: 2 icon (View & Edit).
- **Phân trang (Pagination):** Nằm dưới cùng bên phải của bảng (Trước, 1, 2, 3, Sau).

**Yêu cầu kỹ thuật:**
- Code full file bằng React (hoặc JSX thuần có class Tailwind).
- Sử dụng `lucide-react` hoặc `heroicons` cho các icon.
- Code đảm bảo Responsive cơ bản (Grid chuyển thành cột 1 trên mobile).
- Viết code Clean, comment rõ ràng các sections.
<div align="center">
  <img src="https://raw.githubusercontent.com/vovanty0405/QuanLyDiemSV/master/frontend/src/assets/react.svg" alt="Logo" width="80" height="80">
  <h1 align="center">EduFlow / GradeSys</h1>
  <p align="center">
    <strong>Hệ Thống Quản Lý Điểm Sinh Viên Chuyên Nghiệp</strong>
    <br />
    <br />
    <a href="#tính-năng-nổi-bật">Tính Năng</a>
    ·
    <a href="#công-nghệ-sử-dụng">Công Nghệ</a>
    ·
    <a href="#hướng-dẫn-cài-đặt">Cài Đặt</a>
    ·
    <a href="#tài-khoản-dùng-thử">Dùng Thử</a>
  </p>
</div>

<br />

> **EduFlow / GradeSys** là hệ thống quản lý điểm số sinh viên theo mô hình tín chỉ hiện đại, hỗ trợ toàn diện các quy trình đào tạo, đánh giá điểm số, khiếu nại, và phân quyền động một cách linh hoạt, an toàn và trực quan.

---

## 🌟 Tính Năng Nổi Bật

### 1. 🔐 Phân Quyền Động & Bảo Mật (RBAC)
- **Role-Based Access Control (RBAC)**: Ma trận phân quyền linh hoạt theo từng Chức Năng (Dashboard, Lớp Học Phần, Điểm Số...) và Hành Động (Xem, Thêm, Sửa, Xóa).
- **Phân Quyền Phạm Vi Dữ Liệu (Data Scopes)**: Chỉ định rõ ràng dữ liệu người dùng được phép truy cập (VD: Giảng viên chỉ xem lớp mình phụ trách, Sinh viên chỉ xem điểm cá nhân).

### 2. 🎓 Quản Lý Học Vụ Toàn Diện
- Quản lý đa cấp: **Khoa -> Ngành -> Khung Chương Trình -> Môn Học**.
- Quản lý **Lớp Hành Chính** và **Lớp Học Phần** với cơ chế phân công cố vấn học tập và giảng viên giảng dạy.
- Quản lý **Sinh Viên** và **Giảng Viên** với tính năng nhập/xuất file **Excel (.xlsx)** hàng loạt.

### 3. 📝 Nghiệp Vụ Điểm Số Chuyên Sâu
- **Bảng Điểm Giảng Viên**: Nhập điểm hàng loạt, chốt bảng điểm (khóa chỉnh sửa), yêu cầu Admin mở khóa khi có sai sót.
- **Xử Lý Cải Thiện & Thi Lại**: Hệ thống tự động nhận diện môn học thi lại, áp dụng chuẩn **QC6.0** và tự động quy đổi điểm hệ 10 sang Điểm Chữ (A, B, C, D, F).
- **Tra Cứu Của Sinh Viên**: Xem chi tiết điểm theo từng học kỳ, điểm thành phần (Quá trình, Cuối kỳ) trực quan.

### 4. ⚖️ Quy Trình Khiếu Nại Điểm Khép Kín
- Sinh viên có thể tạo **Đơn Khiếu Nại** trực tiếp vào một kết quả điểm cụ thể.
- Giảng viên tiếp nhận khiếu nại, duyệt hoặc từ chối, và cập nhật điểm số mới trực tiếp từ giao diện xử lý đơn.
- **Hệ thống Notification Realtime**: Thông báo dạng chuông đẩy ngay lập tức các sự kiện (có khiếu nại mới, khiếu nại được phản hồi, mở khóa điểm) kèm tính năng điều hướng tức thì.

### 5. 📊 Thống Kê & Báo Cáo
- Dashboard sinh động với biểu đồ thể hiện **Tỷ lệ đậu/rớt**, phân bổ điểm số của toàn trường hoặc của từng Lớp học phần.

---

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **Node.js & Express.js**: Nền tảng xây dựng API mạnh mẽ, tốc độ cao.
- **Sequelize ORM**: Giao tiếp cơ sở dữ liệu (MySQL), quản lý models và relationships (1-N, N-N).
- **JWT & Bcrypt**: Xác thực và mã hóa mật khẩu an toàn.
- **Zod**: Validation dữ liệu đầu vào chặt chẽ.

### Frontend
- **React.js & Vite**: Xây dựng Single Page Application (SPA) siêu tốc.
- **Tailwind CSS**: Triển khai thiết kế Modern UI/UX, hỗ trợ Dark/Light Theme.
- **Lucide React**: Hệ thống Icon sắc nét, nhẹ nhàng.
- **React Router Dom v6**: Xử lý routing và bảo vệ các private route.
- **Axios & SheetJS (xlsx)**: Giao tiếp API và xử lý xuất/nhập file Excel.

---

## 📁 Cấu Trúc Thư Mục

```text
QuanLyDiemSV/
├── backend/                  # RESTful API server
│   ├── src/
│   │   ├── config/           # Cấu hình Database
│   │   ├── controllers/      # Xử lý logic API
│   │   ├── middlewares/      # Interceptors (Auth, Validation, Error Handling)
│   │   ├── models/           # Sequelize Models (Cấu trúc DB)
│   │   ├── routes/           # Định nghĩa các Endpoints
│   │   └── services/         # Business logic (Điểm số, Phân quyền)
│   └── seed.js               # Script tạo dữ liệu giả lập (Mock data)
│
└── frontend/                 # React UI
    ├── src/
    │   ├── api/              # Cấu hình Axios & Interceptors
    │   ├── components/       # Các UI Component dùng chung (Sidebar, Notifications,...)
    │   ├── context/          # State toàn cục (AuthContext, ThemeContext)
    │   └── pages/            # Các trang giao diện (TraCứu, Điểm Số, Khiếu Nại,...)
    └── index.html
```

---

## 🚀 Hướng Dẫn Cài Đặt

### Yêu Cầu Hệ Thống
- **Node.js** (Phiên bản v18.x trở lên)
- **MySQL Server** (XAMPP hoặc MySQL Workbench)
- **Git**

### 1. Cài đặt Backend
```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt các thư viện
npm install

# Cấu hình biến môi trường
# Copy file .env.example thành .env và điền thông tin Database của bạn
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=
# DB_NAME=QuanLyDiemSV
# JWT_SECRET=your_super_secret_key

# Khởi chạy server (chạy ở port 5000)
npm run dev
```

### 2. Cài đặt Frontend
```bash
# Mở một Terminal mới, di chuyển vào thư mục frontend
cd frontend

# Cài đặt các thư viện
npm install

# Khởi chạy ứng dụng (chạy ở port 5173)
npm run dev
```

---

## 🎲 Dữ Liệu Mẫu (Mock Data)

Hệ thống được trang bị một Script cực kỳ mạnh mẽ để sinh ra cấu trúc dữ liệu khổng lồ (240 sinh viên, hàng ngàn lớp học phần và điểm số). 

Để sinh dữ liệu mẫu, hãy làm theo các bước sau trong thư mục `backend`:

```bash
# Đảm bảo database đã được tạo và các bảng đã sync.
# Chạy lệnh sau để tạo Mock Data:
node seed.js
```

**Chi tiết dữ liệu được sinh ra:**
- **4 Khoa**, **12 Ngành**, **8 Học Kỳ**
- Gần **90 Môn Học** dựa theo đúng khung chuẩn.
- Tự động sinh Điểm Số thực tế với tỷ lệ rớt môn chuẩn (khoảng 8%).
- Tự động cấp Full Quyền cho tài khoản `Admin`.

### 🔑 Tài Khoản Dùng Thử
Sau khi Seed Data thành công, bạn có thể đăng nhập bằng các tài khoản sau:

| Quyền hạn | Tên đăng nhập | Mật khẩu | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Có toàn quyền quản trị, phân quyền, mở khóa điểm. |
| **Giảng Viên** | `GV001` -> `GV015` | `123456` | Có quyền nhập điểm, quản lý lớp mình phụ trách. |
| **Sinh Viên** | `SV001` -> `SV240` | `123456` | Tra cứu điểm, gửi khiếu nại (VD: SV031 đủ ĐK Tốt nghiệp). |

---

## 🤝 Đóng Góp (Contributing)

Dự án này là mã nguồn mở. Mọi đóng góp dưới dạng **Pull Request** hoặc mở **Issues** báo lỗi / đề xuất tính năng đều được hoan nghênh.
1. Fork dự án
2. Tạo Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit các thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên Branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

---

## 📜 Giấy Phép (License)
Dự án được phân phối dưới giấy phép **MIT License**. Xem thêm chi tiết tại tệp `LICENSE`.

<br />

<div align="center">
  <b>Được phát triển với ❤️ bởi <a href="https://github.com/vovanty0405">Võ Văn Tỷ</a></b>
</div>

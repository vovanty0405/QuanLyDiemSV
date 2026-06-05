# Cập nhật Môn Học, Khung Chương Trình Đào Tạo và Đồng Bộ Dữ Liệu Seed

Mục tiêu là tích hợp bộ dữ liệu môn học thực tế từ file `Dữ liệu mẫu môn học và CTDT.md` vào hệ thống, sau đó cập nhật kịch bản tạo dữ liệu (`seed.js`) để sinh ra Lớp Học Phần và phân bổ sinh viên sao cho hợp lý, sát với thực tế chuyên ngành của họ nhất.

## User Review Required

> [!IMPORTANT]
> - Việc này sẽ thay đổi hoàn toàn cách dữ liệu mẫu được sinh ra trong CSDL của bạn. Các môn học cũ sẽ bị xóa bỏ và thay bằng các môn học thực tế.
> - Kịch bản seed sẽ tự động map các môn học vào Khung chương trình đào tạo của 5 ngành chính (Sư phạm Tiếng Anh, SP Nuôi trồng Thủy sản, SP Toán học, CNTT, Kế toán).
> - **Lưu ý**: Sau khi thực hiện xong, bạn sẽ cần chạy lại `node seed.js` (hoặc tôi sẽ chạy giúp bạn) để nạp lại CSDL mới, do đó dữ liệu cũ hiện tại sẽ bị xóa.

## Open Questions

> [!WARNING]
> - Trong file MD, học phần có phân loại "Bắt buộc" và "Tự chọn". Hiện tại tôi sẽ map toàn bộ chúng vào hệ thống Khung Chương Trình.
> - Bạn có muốn tôi tự động thiết lập để sinh viên chỉ đăng ký vào các Lớp Học Phần thuộc chuyên ngành của mình ở Học kỳ 1 và 2 không? (Điều này sẽ giúp dữ liệu test logic và thực tế hơn).

## Proposed Changes

---

### Backend: Parsing Data & Seed Script

Quá trình này bao gồm việc tạo một script tạm thời để chuyển đổi dữ liệu Markdown sang JSON, và nâng cấp script sinh dữ liệu gốc.

#### [NEW] `backend/src/data/parsed_ctdt.json`
- Chứa toàn bộ cấu trúc dữ liệu đã được bóc tách từ file MD (Danh sách Môn Học & Cấu trúc Khung Chương Trình theo ngành).

#### [NEW] `scratch/parse_ctdt.js`
- Script dùng để đọc file MD bằng Regex.
- Tự động nhận diện Ngành học, Học kỳ, và từng dòng CSV chứa môn học.
- Chuẩn hóa tên môn, số tín chỉ, số tiết lý thuyết/thực hành và bóc tách thành các object riêng biệt lưu vào file JSON.

#### [MODIFY] `backend/seed.js`
- **Model Import**: Thêm khai báo model `KhungChuongTrinh`.
- **MonHoc Seed**: Loại bỏ toàn bộ các mảng danh sách môn học cứng (`monHocCNTT`, `monHocSP`...) và thay bằng việc đọc từ file `parsed_ctdt.json`.
- **KhungChuongTrinh Seed**: Chèn dữ liệu mapping giữa `MaNganh` và `MaMon` tương ứng với `HocKyDuKien` vào database.
- **LopHocPhan Seed**: Cập nhật logic để tạo danh sách Lớp học phần tự động dựa trên Khung chương trình của các ngành thay vì tạo ngẫu nhiên.
- **GiangVien Mapping**: Đảm bảo giảng viên được phân công dạy đúng môn thuộc Khoa của mình.

## Verification Plan

### Manual Verification
- Chạy thử `node scratch/parse_ctdt.js` và kiểm tra cấu trúc của file JSON đầu ra.
- Chạy thử `node backend/seed.js` và xác minh thông báo kết quả.
- Dùng trình duyệt truy cập vào các trang Môn Học, Lớp học phần để kiểm tra xem dữ liệu mới đã xuất hiện và đúng logic như trong file CTDT hay chưa.

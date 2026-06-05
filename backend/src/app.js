const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const db = require('./models');
const authRoutes = require('./routes/auth.routes');
const khoaRoutes = require('./routes/khoa.routes');
const nganhRoutes = require('./routes/nganh.routes');
const hockyRoutes = require('./routes/hocky.routes');
const monhocRoutes = require('./routes/monhoc.routes');
const sinhvienRoutes = require('./routes/sinhvien.routes');
const giangvienRoutes = require('./routes/giangvien.routes');
const lophocphanRoutes = require('./routes/lophocphan.routes');
const diemRoutes = require('./routes/diem.routes');
const traCuuDiemRoutes = require('./routes/tracuudiem.routes');
const lophanhchinhRoutes = require('./routes/lophanhchinh.routes');
const taikhoanRoutes = require('./routes/taikhoan.routes');
const phanquyenRoutes = require('./routes/phanquyen.routes');
const khieuNaiRoutes = require('./routes/khieunai.routes');
const thongBaoRoutes = require('./routes/thongbao.routes');
const nhatKyHoatDongRoutes = require('./routes/nhatkyhoatdong.routes');
const khungchuongtrinhRoutes = require('./routes/khungchuongtrinh.routes');
const thongkeRoutes = require('./routes/thongke.routes');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // Setup cơ bản cho Frontend sau này
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Test Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to QuanLyDiemSV API' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/khoa', khoaRoutes);
app.use('/api/nganh', nganhRoutes);
app.use('/api/hocky', hockyRoutes);
app.use('/api/monhoc', monhocRoutes);
app.use('/api/sinhvien', sinhvienRoutes);
app.use('/api/giangvien', giangvienRoutes);
app.use('/api/lophocphan', lophocphanRoutes);
app.use('/api/diem', diemRoutes);
app.use('/api/tracuudiem', traCuuDiemRoutes);
app.use('/api/lophanhchinh', lophanhchinhRoutes);
app.use('/api/taikhoan', taikhoanRoutes);
app.use('/api/phanquyen', phanquyenRoutes);
app.use('/api/khieunai', khieuNaiRoutes);
app.use('/api/thongbao', thongBaoRoutes);
app.use('/api/nhatkyhoatdong', nhatKyHoatDongRoutes);
app.use('/api/khungchuongtrinh', khungchuongtrinhRoutes);
app.use('/api/thongke', thongkeRoutes);

// Catch 404
app.use((req, res, next) => {
    next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;

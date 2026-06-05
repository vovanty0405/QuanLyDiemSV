import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import TrangChu from './pages/TrangChu';
import ThongKe from './pages/ThongKe';
import MonHoc from './pages/MonHoc';
import KhungDaoTao from './pages/KhungDaoTao';

import SinhVien from './pages/SinhVien';
import GiangVien from './pages/GiangVien';
import LopHocPhan from './pages/LopHocPhan';
import LopHanhChinh from './pages/LopHanhChinh';
import DiemSoAdmin from './pages/DiemSoAdmin';
import DiemSoGiangVien from './pages/DiemSoGiangVien';
import TraCuuDiem from './pages/TraCuuDiem';
import TaiKhoan from './pages/TaiKhoan';
import NhatKyHeThong from './pages/NhatKyHeThong';
import PhanQuyenChiTiet from './pages/PhanQuyenChiTiet';
import TeacherComplaintManagement from './pages/TeacherComplaintManagement';

// Wrapper: chuyển hướng đến trang nhập điểm phù hợp theo role
function DiemSoRouter() {
  const { user } = useAuth();
  if (user?.RoleID === 2 || user?.RoleID === 4) return <DiemSoGiangVien />;
  return <DiemSoAdmin />;
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#1d2027',
            color: '#e1e2ec',
            border: '1px solid #32353c',
          }
        }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<TrangChu />} />
            <Route path="/thong-ke" element={<ThongKe />} />
            <Route path="/sinh-vien" element={<SinhVien />} />
            <Route path="/giang-vien" element={<GiangVien />} />
            <Route path="/mon-hoc" element={<MonHoc />} />
            <Route path="/khung-dao-tao" element={<KhungDaoTao />} />
            <Route path="/lop-hoc-phan" element={<LopHocPhan />} />
            <Route path="/lop-hanh-chinh" element={<LopHanhChinh />} />
            <Route path="/diem-so" element={<DiemSoRouter />} />
            <Route path="/tra-cuu-diem" element={<TraCuuDiem />} />
            <Route path="/nhat-ky-he-thong" element={<NhatKyHeThong />} />
            <Route path="/tai-khoan" element={<TaiKhoan />} />
            <Route path="/phan-quyen-chi-tiet/:id" element={<PhanQuyenChiTiet />} />
            <Route path="/khieu-nai" element={<TeacherComplaintManagement />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

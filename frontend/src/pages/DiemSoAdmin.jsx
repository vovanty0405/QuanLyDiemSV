import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Download, Search, Loader2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

// ============================================
// Hàm tính toán
// ============================================
const diemChu = (tk) => {
  if (tk === null || tk === undefined) return '-';
  if (tk >= 9.0) return 'A';
  if (tk >= 8.0) return 'B+';
  if (tk >= 7.0) return 'B';
  if (tk >= 6.5) return 'C+';
  if (tk >= 5.5) return 'C';
  if (tk >= 5.0) return 'D+';
  if (tk >= 4.0) return 'D';
  return 'F';
};

const diemChuColor = (ch) => {
  if (!ch || ch === '-') return 'text-text-muted';
  if (ch === 'A') return 'text-[#10B981] font-bold';
  if (ch === 'B+' || ch === 'B') return 'text-[#4d8eff] font-bold';
  if (ch === 'F') return 'text-[#EF4444] font-bold';
  return 'text-text-primary';
};

const diemHe4 = (he10) => {
  if (he10 === null) return null;
  if (he10 >= 9.0) return 4.0;
  if (he10 >= 8.0) return 3.5;
  if (he10 >= 7.0) return 3.0;
  if (he10 >= 6.5) return 2.5;
  if (he10 >= 5.5) return 2.0;
  if (he10 >= 5.0) return 1.5;
  if (he10 >= 4.0) return 1.0;
  return 0;
};

const xepLoai = (dtb) => {
  if (dtb === null) return { label: '-', color: 'text-text-muted' };
  if (dtb >= 9.0) return { label: 'Xuất sắc', color: 'text-[#10B981]' };
  if (dtb >= 8.0) return { label: 'Giỏi', color: 'text-[#4d8eff]' };
  if (dtb >= 7.0) return { label: 'Khá', color: 'text-[#60a5fa]' };
  if (dtb >= 5.5) return { label: 'Trung bình', color: 'text-[#FFC107]' };
  if (dtb >= 4.0) return { label: 'Yếu', color: 'text-[#ff9800]' };
  return { label: 'Kém', color: 'text-[#EF4444]' };
};

export default function DiemSoAdmin() {
  const { user } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState(null);

  // ============ VIEW 1 STATE ============
  const [sinhViens, setSinhViens] = useState([]);
  const [khoas, setKhoas] = useState([]);
  const [loadingSV, setLoadingSV] = useState(true);
  const [filterKhoa, setFilterKhoa] = useState('');
  const [searchType, setSearchType] = useState('HoTen');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('HoTen');
  const [sortDir, setSortDir] = useState('asc');

  // ============ VIEW 2 STATE ============
  const [bangDiem, setBangDiem] = useState([]);
  const [hocKys, setHocKys] = useState([]);
  const [filterHK, setFilterHK] = useState('');
  const [loadingDiem, setLoadingDiem] = useState(false);

  // ============ FETCH ============
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingSV(true);
        const [svRes, khoaRes, hkRes] = await Promise.all([
          axiosClient.get('/sinhvien'),
          axiosClient.get('/khoa'),
          axiosClient.get('/hocky')
        ]);
        setSinhViens(svRes.data || []);
        setKhoas(khoaRes.data || []);
        setHocKys(hkRes.data || []);
      } catch { toast.error('Lỗi tải dữ liệu'); }
      finally { setLoadingSV(false); }
    };
    fetchData();
  }, []);

  const fetchBangDiem = async (maSV) => {
    try {
      setLoadingDiem(true);
      const res = await axiosClient.get(`/diem/sinh-vien/${maSV}/bang-diem`);
      const data = res.data;
      setBangDiem(data.bangDiem || []);
    } catch { toast.error('Lỗi tải bảng điểm'); setBangDiem([]); }
    finally { setLoadingDiem(false); }
  };

  // ============ VIEW 1 LOGIC ============
  const filteredSV = sinhViens
    .filter(sv => {
      if (filterKhoa) {
        // Lọc theo khoa nếu có - cần check qua LopHanhChinh hoặc trường khác
        // Tạm thời bỏ qua filter khoa nếu data không có
      }
      if (!searchTerm) return true;
      const val = searchTerm.toLowerCase();
      if (searchType === 'MaSV') return sv.MaSV?.toLowerCase().includes(val);
      if (searchType === 'HoTen') return sv.HoTen?.toLowerCase().includes(val);
      if (searchType === 'MaLop') return (sv.MaLop || sv.LopHanhChinh?.TenLop || '').toLowerCase().includes(val);
      return true;
    })
    .sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const handleSelectStudent = (sv) => {
    setSelectedStudent(sv);
    fetchBangDiem(sv.MaSV);
  };

  // Bảng điểm lọc theo HK
  const filteredBangDiem = bangDiem.filter(kq => {
    if (!filterHK) return true;
    return kq.LopHocPhan?.MaHK === filterHK;
  });

  // Thống kê
  const stats = (() => {
    let tongTC = 0, tongDiem = 0, soMonDat = 0, soMonCoDiem = 0;
    filteredBangDiem.forEach(kq => {
      if (kq.DiemTongKet !== null && kq.DiemTongKet !== undefined) {
        soMonCoDiem++;
        const tc = kq.LopHocPhan?.MonHoc?.SoTinChi || 0;
        if (kq.DiemTongKet >= 4.0) {
          soMonDat++;
          tongTC += tc;
          tongDiem += kq.DiemTongKet * tc;
        }
      }
    });
    const dtb = tongTC > 0 ? Math.round((tongDiem / tongTC) * 100) / 100 : null;
    const xl = xepLoai(dtb);
    return { dtb, dtb4: diemHe4(dtb), tongTC, soMonDat, soMonCoDiem, xl };
  })();

  // Excel
  const handleExportExcel = () => {
    const rows = filteredBangDiem.map(kq => ({
      'Mã Môn': kq.LopHocPhan?.MonHoc?.MaMon,
      'Tên Môn': kq.LopHocPhan?.MonHoc?.TenMon,
      'TC': kq.LopHocPhan?.MonHoc?.SoTinChi,
      'Đ.Quá Trình': kq.DiemGK,
      'Đ.Cuối Kỳ': kq.DiemCK,
      'Thi lần 1': kq.DiemThiLan1,
      'Thi lần 2': kq.DiemThiLan2,
      'TK(10)': kq.DiemTongKet,
      'TK(Chữ)': kq.DiemChu
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BangDiem');
    XLSX.writeFile(wb, `BangDiem_${selectedStudent.MaSV}.xlsx`);
  };

  // ============ RENDER ============

  if (!selectedStudent) {
    // ========== VIEW 1: DANH SÁCH TÌM KIẾM SINH VIÊN ==========
    return (
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="mb-8">
          <div className="text-text-muted text-sm mb-2 font-medium">Trang chủ &gt; Tra cứu điểm</div>
          <h2 className="text-3xl font-bold text-text-primary">Xem Điểm Quản Trị Viên</h2>
        </div>

        {/* Top Bar Filters */}
        <div className="bg-surface rounded-xl border border-surface-hover p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="min-w-[160px]">
              <label className="block text-xs font-medium text-text-muted mb-1.5">Khoa</label>
              <select value={filterKhoa} onChange={e => setFilterKhoa(e.target.value)}
                className="w-full bg-canvas border border-surface-hover rounded-lg px-3 py-2 text-text-primary text-sm focus:border-primary outline-none">
                <option value="">Tất cả Khoa</option>
                {khoas.map(k => <option key={k.MaKhoa} value={k.MaKhoa}>{k.TenKhoa}</option>)}
              </select>
            </div>
            <div className="min-w-[140px]">
              <label className="block text-xs font-medium text-text-muted mb-1.5">Loại tìm kiếm</label>
              <select value={searchType} onChange={e => setSearchType(e.target.value)}
                className="w-full bg-canvas border border-surface-hover rounded-lg px-3 py-2 text-text-primary text-sm focus:border-primary outline-none">
                <option value="HoTen">Họ Tên</option>
                <option value="MaSV">Mã SV</option>
                <option value="MaLop">Lớp</option>
              </select>
            </div>
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-medium text-text-muted mb-1.5">Từ khóa</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" placeholder="Nhập từ khóa tìm kiếm..."
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-canvas border border-surface-hover rounded-lg pl-9 pr-4 py-2 text-text-primary text-sm focus:border-primary outline-none" />
              </div>
            </div>
            <div className="min-w-[140px]">
              <label className="block text-xs font-medium text-text-muted mb-1.5">Sắp xếp</label>
              <select value={sortField} onChange={e => setSortField(e.target.value)}
                className="w-full bg-canvas border border-surface-hover rounded-lg px-3 py-2 text-text-primary text-sm focus:border-primary outline-none">
                <option value="HoTen">Họ Tên</option>
                <option value="MaSV">Mã SV</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pb-0.5">
              <label className="flex items-center gap-1.5 text-text-muted text-xs cursor-pointer">
                <input type="radio" name="sortDir" value="asc" checked={sortDir === 'asc'} onChange={e => setSortDir(e.target.value)}
                  className="accent-primary" /> Tăng
              </label>
              <label className="flex items-center gap-1.5 text-text-muted text-xs cursor-pointer">
                <input type="radio" name="sortDir" value="desc" checked={sortDir === 'desc'} onChange={e => setSortDir(e.target.value)}
                  className="accent-primary" /> Giảm
              </label>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-surface rounded-xl border border-surface-hover overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#191b23] border-b border-surface-hover text-text-muted text-[11px] uppercase tracking-wider">
                  <th className="px-5 py-3.5 font-semibold">Mã SV</th>
                  <th className="px-5 py-3.5 font-semibold">Họ Tên</th>
                  <th className="px-5 py-3.5 font-semibold">Ngày Sinh</th>
                  <th className="px-5 py-3.5 font-semibold">Giới tính</th>
                  <th className="px-5 py-3.5 font-semibold">Lớp</th>
                  <th className="px-5 py-3.5 font-semibold">Trạng thái</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-hover">
                {loadingSV ? (
                  <tr><td colSpan="7" className="text-center py-12 text-text-muted"><Loader2 className="animate-spin inline mr-2" />Đang tải...</td></tr>
                ) : filteredSV.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-12 text-text-muted">Không tìm thấy sinh viên nào</td></tr>
                ) : (
                  filteredSV.map(sv => (
                    <tr key={sv.MaSV} className="hover:bg-surface-hover/40 transition-colors">
                      <td className="px-5 py-3 text-text-primary font-medium text-sm">{sv.MaSV}</td>
                      <td className="px-5 py-3 text-text-primary text-sm">{sv.HoTen}</td>
                      <td className="px-5 py-3 text-text-muted text-sm">{sv.NgaySinh || '-'}</td>
                      <td className="px-5 py-3 text-text-muted text-sm">{sv.GioiTinh || '-'}</td>
                      <td className="px-5 py-3 text-text-muted text-sm">{sv.LopHanhChinh?.TenLop || sv.MaLop || '-'}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          sv.TrangThai === 'Đang học' 
                            ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                            : 'bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20'
                        }`}>{sv.TrangThai || 'Đang học'}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => handleSelectStudent(sv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors shadow-sm">
                          Xem Điểm <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ========== VIEW 2: CHI TIẾT ĐIỂM SINH VIÊN ==========
  return (
    <div className="max-w-[1600px] mx-auto w-full space-y-5">
      {/* ===== PHẦN 1: THÔNG TIN ===== */}
      <div className="bg-surface rounded-xl border border-surface-hover p-5 mb-5 relative">
        <button onClick={() => { setSelectedStudent(null); setBangDiem([]); }}
            className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-surface-hover text-text-muted hover:border-primary hover:text-primary transition-colors">
            <ArrowLeft size={14} /> Quay lại
        </button>
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Thông tin Sinh viên</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Mã Sinh Viên', value: selectedStudent.MaSV, highlight: true },
            { label: 'Họ Và Tên', value: selectedStudent.HoTen },
            { label: 'Lớp', value: selectedStudent.LopHanhChinh?.TenLop || selectedStudent.MaLop },
            { label: 'Ngày Sinh', value: selectedStudent.NgaySinh },
            { label: 'Giới Tính', value: selectedStudent.GioiTinh },
            { label: 'Email', value: selectedStudent.Email },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="flex flex-col">
              <span className="text-text-muted text-xs mb-1">{label}</span>
              <span className={`text-sm font-medium ${highlight ? 'text-primary' : 'text-text-primary'}`}>{value || '-'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== PHẦN 2: BẢNG ĐIỂM + TỔNG KẾT ===== */}
      <div className="bg-surface rounded-xl border border-surface-hover overflow-hidden shadow-sm">
        {/* Header với filter HK */}
        <div className="p-4 border-b border-surface-hover flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Bảng điểm chi tiết</h3>
          <div className="flex items-center gap-3">
            <select value={filterHK} onChange={e => setFilterHK(e.target.value)}
              className="bg-canvas border border-surface-hover rounded-lg px-3 py-1.5 text-text-primary text-sm focus:border-primary outline-none">
              <option value="">Tất cả Học kỳ</option>
              {hocKys.map(hk => <option key={hk.MaHK} value={hk.MaHK}>{hk.TenHK}</option>)}
            </select>
            <button onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-surface-hover text-text-muted hover:border-[#10B981] hover:text-[#10B981] transition-colors">
                <Download size={14} /> Xuất Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#191b23] border-b border-surface-hover text-text-muted text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Mã Môn</th>
                <th className="px-4 py-3 font-semibold min-w-[180px]">Tên Môn</th>
                <th className="px-3 py-3 font-semibold text-center w-12">TC</th>
                <th className="px-3 py-3 font-semibold text-center w-24">Đ.Quá Trình</th>
                <th className="px-3 py-3 font-semibold text-center w-24">Đ.Cuối Kỳ</th>
                <th className="px-3 py-3 font-semibold text-center w-20">Thi L1</th>
                <th className="px-3 py-3 font-semibold text-center w-20">Thi L2</th>
                <th className="px-3 py-3 font-semibold text-center w-20">TK(10)</th>
                <th className="px-3 py-3 font-semibold text-center w-16">TK(CH)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-hover">
              {loadingDiem ? (
                <tr><td colSpan="9" className="text-center py-10 text-text-muted"><Loader2 className="animate-spin inline mr-2" />Đang tải...</td></tr>
              ) : filteredBangDiem.length === 0 ? (
                <tr><td colSpan="9" className="text-center py-10 text-text-muted">Chưa có dữ liệu điểm</td></tr>
              ) : (
                filteredBangDiem.map(kq => {
                  const ch = kq.DiemChu || diemChu(kq.DiemTongKet);
                  return (
                    <tr key={kq.MaKQ} className="hover:bg-surface-hover/40 transition-colors">
                      <td className="px-4 py-3 text-text-primary font-medium text-sm">{kq.LopHocPhan?.MonHoc?.MaMon}</td>
                      <td className="px-4 py-3 text-text-primary text-sm">{kq.LopHocPhan?.MonHoc?.TenMon}</td>
                      <td className="px-3 py-3 text-center text-text-muted text-sm">{kq.LopHocPhan?.MonHoc?.SoTinChi}</td>
                      <td className="px-3 py-3 text-center font-semibold text-primary/80 text-sm">{kq.DiemGK ?? '-'}</td>
                      <td className="px-3 py-3 text-center font-semibold text-text-primary text-sm">{kq.DiemCK ?? '-'}</td>
                      <td className="px-3 py-3 text-center text-text-muted text-sm">{kq.DiemThiLan1 ?? '-'}</td>
                      <td className="px-3 py-3 text-center text-text-muted text-sm">{kq.DiemThiLan2 ?? '-'}</td>
                      <td className="px-3 py-3 text-center font-bold text-sm text-text-primary">{kq.DiemTongKet !== null ? kq.DiemTongKet : '-'}</td>
                      <td className={`px-3 py-3 text-center text-sm font-bold ${diemChuColor(ch)}`}>{ch}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Tổng Kết Học Kỳ */}
        {filteredBangDiem.length > 0 && (
          <div className="p-5 border-t border-surface-hover bg-[#191b23]/50">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-text-muted text-xs mb-1">ĐTB Học Kỳ (10)</div>
                <div className="text-xl font-bold text-text-primary">{stats.dtb !== null ? stats.dtb.toFixed(2) : '-'}</div>
              </div>
              <div className="text-center">
                <div className="text-text-muted text-xs mb-1">ĐTB Học Kỳ (4)</div>
                <div className="text-xl font-bold text-text-primary">{stats.dtb4 !== null ? stats.dtb4.toFixed(1) : '-'}</div>
              </div>
              <div className="text-center">
                <div className="text-text-muted text-xs mb-1">Tín chỉ đạt</div>
                <div className="text-xl font-bold text-primary">{stats.tongTC}</div>
              </div>
              <div className="text-center">
                <div className="text-text-muted text-xs mb-1">Số môn có điểm</div>
                <div className="text-xl font-bold text-text-primary">{stats.soMonCoDiem}</div>
              </div>
              <div className="text-center">
                <div className="text-text-muted text-xs mb-1">Môn đạt</div>
                <div className="text-xl font-bold text-[#10B981]">{stats.soMonDat}</div>
              </div>
              <div className="text-center">
                <div className="text-text-muted text-xs mb-1">Xếp loại</div>
                <div className={`text-xl font-bold ${stats.xl.color}`}>{stats.xl.label}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import { Plus, Edit, Trash2, X, Upload, Download, Loader2, Search, UserPlus, Minus, AlertTriangle, Users, Save, CheckCircle2, Eye, CalendarDays, LockOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

// Helper for UI colors
const getStatusStyle = (status) => {
  if (status === 'Đã chốt') return 'bg-surface-hover text-text-muted border border-surface-hover';
  if (status === 'Đang mở' || status === 'MoDangKy') return 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20';
  return 'bg-[#df7412]/10 text-[#df7412] border border-[#df7412]/20';
};

const getStatusLabel = (status) => {
    if (status === 'MoDangKy') return 'Đang mở';
    return status;
}

export default function LopHocPhan() {
  const [lhpList, setLhpList] = useState([]);
  const [monHocs, setMonHocs] = useState([]);
  const [hocKys, setHocKys] = useState([]);
  const [giangViens, setGiangViens] = useState([]);
  const [khoas, setKhoas] = useState([]);
  const [allStudents, setAllStudents] = useState([]); 
  
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHK, setFilterHK] = useState('');
  const [filterKhoa, setFilterKhoa] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Modal State for Khoa Filter
  const [modalKhoaFilter, setModalKhoaFilter] = useState('');

  // Quản lý Học Kỳ State
  const [isHkModalOpen, setIsHkModalOpen] = useState(false);
  const [editingHk, setEditingHk] = useState(null);
  const [hkForm, setHkForm] = useState({ MaHK: '', TenHK: '', NamBatDau: new Date().getFullYear(), NamKetThuc: new Date().getFullYear() + 1 });
  const [searchHk, setSearchHk] = useState('');
  const [filterHkYear, setFilterHkYear] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLHP, setEditingLHP] = useState(null);
  const [formData, setFormData] = useState({ 
    MaLHP: '', TenLopHP: '', MaMon: '', MaHK: '', MaGV: '', 
    PhongHoc: '', SiSoToiDa: 40, TrangThai: 'MoDangKy' 
  });

  // Enrollment Centered Modal State
  const [selectedClassForEnrollment, setSelectedClassForEnrollment] = useState(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [loadingEnrollData, setLoadingEnrollData] = useState(false);
  const [stagedAvailable, setStagedAvailable] = useState([]);
  const [stagedEnrolled, setStagedEnrolled] = useState([]);
  const [searchStudent, setSearchStudent] = useState('');
  const [isSavingEnrollment, setIsSavingEnrollment] = useState(false);
  const [enrollmentErrorMsg, setEnrollmentErrorMsg] = useState('');

  // View Details Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewedClassDetails, setViewedClassDetails] = useState(null);
  const [loadingView, setLoadingView] = useState(false);
  
  // Excel State
  const fileInputRef = useRef(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [excelPreviewData, setExcelPreviewData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lhpRes, mhRes, hkRes, gvRes, khoaRes] = await Promise.all([
        axiosClient.get('/lophocphan'),
        axiosClient.get('/monhoc'),
        axiosClient.get('/hocky'),
        axiosClient.get('/giangvien'),
        axiosClient.get('/khoa')
      ]);
      setLhpList(lhpRes.data || []);
      setMonHocs(mhRes.data || []);
      setHocKys(hkRes.data || []);
      setGiangViens(gvRes.data || []);
      setKhoas(khoaRes.data || []);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu Lớp học phần');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLhpList = lhpList.filter(lhp => {
    const matchSearch = (lhp.MaLHP?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        lhp.TenLopHP?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        lhp.MonHoc?.TenMon?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchHK = !filterHK || lhp.MaHK === filterHK;
    const matchStatus = !filterStatus || lhp.TrangThai === filterStatus;
    const matchKhoa = !filterKhoa || lhp.MonHoc?.MaKhoa === filterKhoa;
    return matchSearch && matchHK && matchStatus && matchKhoa;
  });

  useEffect(() => {
      setCurrentPage(1);
  }, [searchTerm, filterHK, filterStatus, filterKhoa]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLhpList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLhpList.length / itemsPerPage);

  const handlePageChange = (page) => {
      if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // --- HOC KY HANDLERS ---
  const handleOpenHkModal = (hk = null) => {
    if (hk) {
      setEditingHk(hk);
      setHkForm({ ...hk });
    } else {
      setEditingHk(null);
      setHkForm({ MaHK: '', TenHK: '', NamBatDau: new Date().getFullYear(), NamKetThuc: new Date().getFullYear() + 1 });
    }
  };

  const handleSubmitHk = async (e) => {
    e.preventDefault();
    try {
      if (editingHk) {
        await axiosClient.put(`/hocky/${editingHk.MaHK}`, hkForm);
        toast.success('Cập nhật Học kỳ thành công');
      } else {
        await axiosClient.post('/hocky', hkForm);
        toast.success('Thêm Học kỳ mới thành công');
      }
      setEditingHk(null);
      setHkForm({ MaHK: '', TenHK: '', NamBatDau: new Date().getFullYear(), NamKetThuc: new Date().getFullYear() + 1 });
      fetchData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDeleteHk = async (maHK) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa Học kỳ này? (Không thể khôi phục)')) {
      try {
        await axiosClient.delete(`/hocky/${maHK}`);
        toast.success('Đã xóa Học kỳ');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi xóa Học kỳ');
      }
    }
  };

  const filteredHocKys = hocKys.filter(hk => {
    const matchSearch = hk.TenHK?.toLowerCase().includes(searchHk.toLowerCase()) || hk.MaHK?.toLowerCase().includes(searchHk.toLowerCase());
    const matchYear = !filterHkYear || hk.NamBatDau === parseInt(filterHkYear) || hk.NamKetThuc === parseInt(filterHkYear);
    return matchSearch && matchYear;
  });

  const uniqueYears = Array.from(new Set([...hocKys.map(hk => hk.NamBatDau), ...hocKys.map(hk => hk.NamKetThuc)])).sort((a,b) => b - a);

  // --- EXCEL HANDLERS ---
  const handleExportExcel = () => {
    const dataToExport = lhpList.map(lhp => ({
      'Mã LHP': lhp.MaLHP,
      'Tên Lớp HP': lhp.TenLopHP,
      'Mã Môn': lhp.MaMon,
      'Mã Học Kỳ': lhp.MaHK,
      'Mã GV': lhp.MaGV,
      'Phòng Học': lhp.PhongHoc,
      'Sĩ Số Tối Đa': lhp.SiSoToiDa,
      'Trạng Thái': getStatusLabel(lhp.TrangThai)
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LopHocPhan');
    XLSX.writeFile(workbook, 'DanhSachLopHocPhan.xlsx');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      const existingMaLHPs = new Set(lhpList.map(lhp => String(lhp.MaLHP).trim().toLowerCase()));
      const seenInExcel = new Set();

      const formattedData = data.map(row => {
        const maLHPStr = String(row['Mã LHP'] || '').trim();
        const lowerMaLHP = maLHPStr.toLowerCase();
        
        let isDuplicate = false;
        if (!maLHPStr) {
          isDuplicate = true;
        } else if (existingMaLHPs.has(lowerMaLHP) || seenInExcel.has(lowerMaLHP)) {
          isDuplicate = true;
        } else {
          seenInExcel.add(lowerMaLHP);
        }

        return {
          MaLHP: maLHPStr,
          TenLopHP: row['Tên Lớp HP'] || '',
          MaMon: row['Mã Môn'] ? String(row['Mã Môn']) : null,
          MaHK: row['Mã Học Kỳ'] ? String(row['Mã Học Kỳ']) : null,
          MaGV: row['Mã GV'] ? String(row['Mã GV']) : null,
          PhongHoc: row['Phòng Học'] ? String(row['Phòng Học']) : null,
          SiSoToiDa: row['Sĩ Số Tối Đa'] ? Number(row['Sĩ Số Tối Đa']) : 40,
          TrangThai: row['Trạng Thái'] || 'MoDangKy',
          isDuplicate
        };
      });

      setExcelPreviewData(formattedData);
      setIsPreviewModalOpen(true);
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const confirmImportExcel = async () => {
    try {
      setIsImporting(true);
      const validData = excelPreviewData.filter(row => !row.isDuplicate);
      
      if (validData.length === 0) {
        toast.error('Không có dữ liệu hợp lệ để nhập!');
        setIsImporting(false);
        return;
      }

      const payload = validData.map(row => {
        const { isDuplicate, ...rest } = row;
        return rest;
      });

      await axiosClient.post('/lophocphan/bulk', payload);
      toast.success(`Đã nhập thành công ${payload.length} dòng dữ liệu!`);
      setIsPreviewModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi nhập Excel');
    } finally {
      setIsImporting(false);
    }
  };

  // --- CRUD MODAL HANDLERS ---
  const handleOpenModal = (lhp = null) => {
    if (lhp) {
      setEditingLHP(lhp);
      const lhpKhoa = lhp.MonHoc?.MaKhoa || (monHocs.find(m => m.MaMon === lhp.MaMon)?.MaKhoa) || '';
      setModalKhoaFilter(lhpKhoa);
      setFormData({ 
        MaLHP: lhp.MaLHP, TenLopHP: lhp.TenLopHP || '', 
        MaMon: lhp.MaMon || '', MaHK: lhp.MaHK || '', MaGV: lhp.MaGV || '', 
        PhongHoc: lhp.PhongHoc || '', SiSoToiDa: lhp.SiSoToiDa || 40, 
        TrangThai: lhp.TrangThai || 'MoDangKy' 
      });
    } else {
      setEditingLHP(null);
      setModalKhoaFilter('');
      setFormData({ 
        MaLHP: '', TenLopHP: '', 
        MaMon: monHocs.length > 0 ? monHocs[0].MaMon : '', 
        MaHK: hocKys.length > 0 ? hocKys[0].MaHK : '', 
        MaGV: giangViens.length > 0 ? giangViens[0].MaGV : '', 
        PhongHoc: '', SiSoToiDa: 40, TrangThai: 'MoDangKy' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, SiSoToiDa: Number(formData.SiSoToiDa) };
      
      if (editingLHP) {
        await axiosClient.put(`/lophocphan/${editingLHP.MaLHP}`, payload);
        toast.success('Cập nhật Lớp học phần thành công');
      } else {
        await axiosClient.post('/lophocphan', payload);
        toast.success('Tạo Lớp học phần mới thành công');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (maLHP) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa Lớp học phần này?')) {
      try {
        await axiosClient.delete(`/lophocphan/${maLHP}`);
        toast.success('Đã xóa Lớp học phần');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi xóa Lớp học phần');
      }
    }
  };

  // --- ENROLLMENT MODAL HANDLERS (Local State Bulk Action) ---
  const handleOpenEnrollModal = async (lhp) => {
    setSelectedClassForEnrollment(lhp);
    setIsEnrollModalOpen(true);
    setLoadingEnrollData(true);
    setSearchStudent('');
    setEnrollmentErrorMsg('');
    try {
      // 1. Fetch current enrolled students
      const resLhp = await axiosClient.get(`/lophocphan/${lhp.MaLHP}`);
      const kqList = resLhp.data.KetQuaHocTaps || [];
      const enrolled = kqList.map(kq => ({
        MaSV: kq.SinhVien.MaSV,
        HoTen: kq.SinhVien.HoTen,
        MaLop: kq.SinhVien.LopHanhChinh?.TenLop || kq.SinhVien.MaLop || '',
        HasScores: kq.DiemCC !== null || kq.DiemGK !== null || kq.DiemCK !== null
      }));
      setStagedEnrolled(enrolled);
      
      // 2. Fetch all students for the available list
      let all = allStudents;
      if (all.length === 0) {
          const resSV = await axiosClient.get('/sinhvien');
          all = resSV.data;
          setAllStudents(all);
      }

      // 3. Filter available students
      const enrolledMaSVs = new Set(enrolled.map(e => e.MaSV));
      const available = all
        .filter(sv => !enrolledMaSVs.has(sv.MaSV))
        .map(sv => ({
            MaSV: sv.MaSV,
            HoTen: sv.HoTen,
            MaLop: sv.LopHanhChinh?.TenLop || sv.MaLop || '',
            HasScores: false
        }));
      setStagedAvailable(available);

    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu xếp lớp');
      setIsEnrollModalOpen(false);
    } finally {
      setLoadingEnrollData(false);
    }
  };

  const moveRight = (sv) => {
      setStagedAvailable(prev => prev.filter(item => item.MaSV !== sv.MaSV));
      setStagedEnrolled(prev => [...prev, sv]);
  };

  const moveLeft = (sv) => {
      if (sv.HasScores) {
          toast.error(`Không thể loại ${sv.HoTen} vì đã có điểm trong hệ thống.`);
          return;
      }
      setStagedEnrolled(prev => prev.filter(item => item.MaSV !== sv.MaSV));
      setStagedAvailable(prev => [...prev, sv]);
  };

  const visibleAvailableStudents = stagedAvailable.filter(sv => 
      !searchStudent || 
      sv.MaSV.toLowerCase().includes(searchStudent.toLowerCase()) || 
      sv.HoTen.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const moveAllRight = () => {
      const toMove = visibleAvailableStudents;
      const toMoveMaSVs = new Set(toMove.map(s => s.MaSV));
      setStagedAvailable(prev => prev.filter(sv => !toMoveMaSVs.has(sv.MaSV)));
      setStagedEnrolled(prev => [...prev, ...toMove]);
  };

  const handleSaveEnrollment = async () => {
      try {
          setIsSavingEnrollment(true);
          setEnrollmentErrorMsg('');
          
          const payload = {
              danhSachMaSV: stagedEnrolled.map(s => s.MaSV)
          };
          
          const res = await axiosClient.post(`/lophocphan/${selectedClassForEnrollment.MaLHP}/dangky-hang-loat`, payload);
          toast.success(res.message || 'Đã lưu danh sách xếp lớp thành công!');
          setIsEnrollModalOpen(false);
          fetchData(); // Refresh main list
      } catch (err) {
          const msg = err.response?.data?.message || err.message || 'Lỗi hệ thống khi xếp lớp';
          setEnrollmentErrorMsg(msg);
          // Scroll error message into view by default since it might be long
      } finally {
          setIsSavingEnrollment(false);
      }
  };

  const handleOpenViewModal = async (lhp) => {
    setIsViewModalOpen(true);
    setLoadingView(true);
    setViewedClassDetails({ ...lhp, students: [] });
    try {
      const res = await axiosClient.get(`/lophocphan/${lhp.MaLHP}`);
      const kqList = res.data.KetQuaHocTaps || [];
      const students = kqList.map(kq => ({
        MaSV: kq.SinhVien.MaSV,
        HoTen: kq.SinhVien.HoTen,
        MaLop: kq.SinhVien.LopHanhChinh?.TenLop || kq.SinhVien.MaLop || '',
      }));
      setViewedClassDetails(prev => ({ ...prev, students }));
    } catch (error) {
      toast.error('Lỗi khi tải chi tiết lớp');
    } finally {
      setLoadingView(false);
    }
  };

  const handleUnlockGrades = async (maLHP) => {
      if (window.confirm('Bạn có chắc chắn muốn mở khóa điểm cho lớp học phần này?')) {
          try {
              await axiosClient.put(`/diem/lophocphan/${maLHP}/mo-khoa-diem`);
              toast.success('Mở khóa điểm thành công!');
              fetchData();
          } catch (error) {
              toast.error(error.response?.data?.message || 'Lỗi khi mở khóa điểm');
          }
      }
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full">
      {/* 1. Header & Breadcrumbs */}
      <div className="mb-6">
        <div className="text-text-muted text-sm mb-2 font-medium">Trang chủ &gt; Lớp học phần</div>
        <h2 className="text-3xl font-bold text-text-primary">Quản lý Lớp Học Phần</h2>
      </div>

      {/* 2. Top Bar & Filters */}
      <div className="bg-surface rounded-xl border border-surface-hover p-4 mb-6 flex flex-col md:flex-row justify-between gap-4">
        {/* Left: Filters */}
        <div className="flex flex-wrap gap-3 items-center">
            <div className="relative w-full md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" placeholder="Tìm kiếm Tên/Mã LHP..."
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-canvas border border-surface-hover rounded-lg pl-9 pr-4 py-2 text-text-primary text-sm focus:border-primary outline-none transition-colors" />
            </div>
            
            <select value={filterKhoa} onChange={e => setFilterKhoa(e.target.value)}
                className="bg-canvas border border-surface-hover rounded-lg px-3 py-2 text-text-primary text-sm focus:border-primary outline-none transition-colors">
                <option value="">Tất cả Khoa</option>
                {khoas.map(k => <option key={k.MaKhoa} value={k.MaKhoa}>{k.TenKhoa}</option>)}
            </select>

            <select value={filterHK} onChange={e => setFilterHK(e.target.value)}
                className="bg-canvas border border-surface-hover rounded-lg px-3 py-2 text-text-primary text-sm focus:border-primary outline-none transition-colors">
                <option value="">Tất cả Học Kỳ</option>
                {hocKys.map(hk => <option key={hk.MaHK} value={hk.MaHK}>{hk.TenHK} ({hk.NamBatDau}-{hk.NamKetThuc})</option>)}
            </select>
            
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="bg-canvas border border-surface-hover rounded-lg px-3 py-2 text-text-primary text-sm focus:border-primary outline-none transition-colors">
                <option value="">Tất cả Trạng thái</option>
                <option value="MoDangKy">Đang mở</option>
                <option value="Đã chốt">Đã chốt</option>
                <option value="Hủy">Hủy</option>
                <option value="Chờ mở đăng ký">Chờ mở đăng ký</option>
            </select>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap gap-2 items-center">
            <button onClick={() => setIsHkModalOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded font-medium border border-surface-hover text-[#4d8eff] bg-[#4d8eff]/10 hover:bg-[#4d8eff]/20 transition-colors text-sm">
                <CalendarDays size={16} /> Quản lý Học Kỳ
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" className="hidden" />
            <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-1.5 px-3 py-2 rounded font-medium border border-surface-hover text-text-muted hover:border-primary hover:text-primary transition-colors text-sm">
                <Upload size={16} /> Nhập Excel
            </button>
            <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-2 rounded font-medium border border-surface-hover text-text-muted hover:border-semantic-success hover:text-semantic-success transition-colors text-sm">
                <Download size={16} /> Xuất Excel
            </button>
            <button onClick={() => handleOpenModal()} className="flex items-center gap-1.5 px-4 py-2 rounded font-medium bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 text-sm">
                <Plus size={16} /> Thêm mới
            </button>
        </div>
      </div>

      {/* 3. Data Table */}
      <div className="bg-surface rounded-xl border border-surface-hover overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#191b23] border-b border-surface-hover text-text-muted text-[11px] uppercase tracking-wider">
                <th className="px-5 py-4 font-semibold">Mã LHP</th>
                <th className="px-5 py-4 font-semibold min-w-[180px]">Tên Lớp HP</th>
                <th className="px-5 py-4 font-semibold">Môn Học</th>
                <th className="px-5 py-4 font-semibold">Giảng Viên</th>
                <th className="px-5 py-4 font-semibold">Phòng / HK</th>
                <th className="px-5 py-4 font-semibold text-center">Sĩ số</th>
                <th className="px-5 py-4 font-semibold">Trạng thái</th>
                <th className="px-5 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-hover">
              {loading ? (
                <tr><td colSpan="8" className="text-center py-12 text-text-muted"><Loader2 className="animate-spin inline mr-2" /> Đang tải dữ liệu...</td></tr>
              ) : filteredLhpList.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-12 text-text-muted">Không tìm thấy lớp học phần nào</td></tr>
              ) : (
                currentItems.map((lhp) => (
                  <tr key={lhp.MaLHP} className="hover:bg-surface-hover/50 transition-colors group">
                    <td className="px-5 py-4 text-text-primary font-medium text-sm">{lhp.MaLHP}</td>
                    <td className="px-5 py-4 text-text-primary text-sm">{lhp.TenLopHP}</td>
                    <td className="px-5 py-4 text-text-muted text-sm">{lhp.MonHoc?.TenMon || lhp.MaMon}</td>
                    <td className="px-5 py-4 text-text-muted text-sm">{lhp.GiangVien?.HoTen || lhp.MaGV}</td>
                    <td className="px-5 py-4 text-text-muted text-sm">
                        <div>{lhp.PhongHoc || 'Chưa xếp phòng'}</div>
                        <div className="text-xs opacity-70 mt-0.5">
                            {(() => {
                                const hkInfo = hocKys.find(h => h.MaHK === lhp.MaHK);
                                return hkInfo ? `${hkInfo.TenHK} (${hkInfo.NamBatDau}-${hkInfo.NamKetThuc})` : (lhp.HocKy?.TenHK || lhp.MaHK);
                            })()}
                        </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                        <span className="text-sm font-medium text-text-primary">
                            {lhp.KetQuaHocTaps?.length || 0} / {lhp.SiSoToiDa}
                        </span>
                    </td>
                    <td className="px-5 py-4">
                       <div className="flex flex-col gap-1.5 items-start">
                           <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(lhp.TrangThai)}`}>
                             {getStatusLabel(lhp.TrangThai)}
                           </span>
                           <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                               lhp.TrangThaiNhapDiem === 'Đã chốt điểm' ? 'bg-[#EF4444]/10 text-[#EF4444]' : 
                               lhp.TrangThaiNhapDiem === 'Đang nhập liệu' ? 'bg-[#4d8eff]/10 text-[#4d8eff]' : 'bg-surface-hover text-text-muted'
                           }`}>
                               {lhp.TrangThaiNhapDiem || 'Vui lòng nhập điểm'}
                           </span>
                       </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleOpenEnrollModal(lhp)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white rounded transition-colors text-xs font-semibold mr-2">
                           <UserPlus size={14} /> Xếp lớp
                        </button>
                        {lhp.TrangThaiNhapDiem === 'Đã chốt điểm' && (
                            <button onClick={() => handleUnlockGrades(lhp.MaLHP)} className="p-1.5 text-text-muted hover:text-[#FFC107] hover:bg-[#FFC107]/10 rounded transition-colors mr-1" title="Mở khóa điểm">
                              <LockOpen size={16} />
                            </button>
                        )}
                        <button onClick={() => handleOpenViewModal(lhp)} className="p-1.5 text-text-muted hover:text-[#10B981] hover:bg-[#10B981]/10 rounded transition-colors" title="Xem chi tiết">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleOpenModal(lhp)} className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Chỉnh sửa">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(lhp.MaLHP)} className="p-1.5 text-text-muted hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded transition-colors" title="Xóa">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 0 && (
            <div className="flex justify-between items-center px-5 py-4 border-t border-surface-hover bg-[#191b23] rounded-b-xl">
                <span className="text-sm text-text-muted">
                    Hiển thị {indexOfFirstItem + 1} đến {Math.min(indexOfLastItem, filteredLhpList.length)} trong tổng số {filteredLhpList.length} lớp học phần
                </span>
                <div className="flex gap-1">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-sm rounded bg-surface border border-surface-hover text-text-primary hover:bg-surface-hover disabled:opacity-50 transition-colors"
                    >
                        Trang trước
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;
                        
                        return (
                            <button 
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-1.5 text-sm rounded border ${currentPage === pageNum ? 'bg-primary border-primary text-white' : 'bg-surface border-surface-hover text-text-primary hover:bg-surface-hover'} transition-colors`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    
                    <button 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 text-sm rounded bg-surface border border-surface-hover text-text-primary hover:bg-surface-hover disabled:opacity-50 transition-colors"
                    >
                        Trang sau
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* 4. Enrollment Centered Modal (Bulk Save Logic) */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl w-full max-w-6xl h-[85vh] shadow-2xl flex flex-col border border-surface-hover overflow-hidden animate-fade-in-up">
                
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-surface-hover flex justify-between items-center bg-[#191b23]">
                    <div>
                        <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                            <Users size={20} className="text-primary" /> Xếp Lớp Hàng Loạt: {selectedClassForEnrollment?.TenLopHP}
                        </h3>
                        <p className="text-text-muted text-sm mt-1">Môn: {selectedClassForEnrollment?.MonHoc?.TenMon} (Mã LHP: {selectedClassForEnrollment?.MaLHP})</p>
                    </div>
                    <button onClick={() => setIsEnrollModalOpen(false)} className="p-2 text-text-muted hover:text-[#EF4444] hover:bg-surface-hover rounded transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                {/* Modal Body: Dual Listbox */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Error Banner */}
                    {enrollmentErrorMsg && (
                        <div className="m-6 mb-0 p-4 rounded-xl bg-[#df7412]/10 border border-[#df7412]/30 flex items-start gap-3">
                            <AlertTriangle className="text-[#df7412] shrink-0 mt-0.5" size={20} />
                            <div className="text-[#df7412] text-sm whitespace-pre-wrap font-medium flex-1">
                                {enrollmentErrorMsg}
                            </div>
                            <button onClick={() => setEnrollmentErrorMsg('')} className="text-[#df7412] hover:bg-[#df7412]/20 p-1 rounded"><X size={16}/></button>
                        </div>
                    )}

                    {loadingEnrollData ? (
                        <div className="flex items-center justify-center h-full text-text-muted flex-col gap-3">
                            <Loader2 className="animate-spin" size={32} />
                            <span>Đang tải dữ liệu xếp lớp...</span>
                        </div>
                    ) : (
                        <div className="flex h-full gap-6 p-6 overflow-hidden">
                            
                            {/* Left Column: Available Students */}
                            <div className="flex-1 flex flex-col bg-canvas rounded-xl border border-surface-hover overflow-hidden">
                                <div className="p-4 border-b border-surface-hover bg-[#191b23]">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-text-primary text-sm">Sinh viên có thể thêm</h4>
                                        <button 
                                            onClick={moveAllRight}
                                            disabled={visibleAvailableStudents.length === 0}
                                            className="text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                                        >
                                            Thêm tất cả
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                        <input type="text" placeholder="Tìm tên, mã sinh viên..."
                                            value={searchStudent} onChange={e => setSearchStudent(e.target.value)}
                                            className="w-full bg-surface border border-surface-hover rounded-lg pl-8 pr-3 py-1.5 text-text-primary text-sm focus:border-primary outline-none" />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2">
                                    {visibleAvailableStudents.length === 0 ? (
                                        <div className="p-4 text-center text-text-muted text-sm">Không tìm thấy sinh viên phù hợp</div>
                                    ) : (
                                        <ul className="space-y-1">
                                            {visibleAvailableStudents.map(sv => (
                                                <li key={sv.MaSV} className="p-3 rounded-lg hover:bg-surface border border-transparent hover:border-surface-hover group transition-colors flex justify-between items-center">
                                                    <div>
                                                        <div className="font-medium text-text-primary text-sm">{sv.HoTen}</div>
                                                        <div className="text-text-muted text-xs mt-0.5">{sv.MaSV} - {sv.MaLop}</div>
                                                    </div>
                                                    <button 
                                                        onClick={() => moveRight(sv)}
                                                        className="p-1.5 text-primary bg-primary/10 rounded hover:bg-primary hover:text-white transition-colors"
                                                        title="Thêm vào lớp"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Enrolled Students */}
                            <div className="flex-1 flex flex-col bg-canvas rounded-xl border border-surface-hover overflow-hidden">
                                <div className="p-4 border-b border-surface-hover bg-[#191b23]">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-semibold text-[#10B981] text-sm">Danh sách đang chọn</h4>
                                        <span className="text-sm font-bold text-[#10B981]">
                                            {stagedEnrolled.length} / {selectedClassForEnrollment?.SiSoToiDa}
                                        </span>
                                    </div>
                                    <div className="h-[34px] flex items-center">
                                        <div className="w-full bg-surface-hover/30 rounded-full h-2 overflow-hidden border border-surface-hover">
                                            <div 
                                                className={`h-full transition-all duration-300 ${stagedEnrolled.length > selectedClassForEnrollment?.SiSoToiDa ? 'bg-[#EF4444]' : 'bg-[#10B981]'}`}
                                                style={{ width: `${Math.min(100, (stagedEnrolled.length / (selectedClassForEnrollment?.SiSoToiDa || 40)) * 100)}%`}}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2">
                                    {stagedEnrolled.length === 0 ? (
                                        <div className="p-4 text-center text-text-muted text-sm">Danh sách trống</div>
                                    ) : (
                                        <ul className="space-y-1">
                                            {stagedEnrolled.map((sv, idx) => (
                                                <li key={sv.MaSV} className="p-3 rounded-lg hover:bg-surface border border-transparent hover:border-surface-hover group transition-colors flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-text-muted text-xs w-4">{idx + 1}.</span>
                                                        <div>
                                                            <div className="font-medium text-text-primary text-sm">{sv.HoTen}</div>
                                                            <div className="text-text-muted text-xs mt-0.5">{sv.MaSV} {sv.HasScores ? <span className="text-primary italic ml-1">(Đã có điểm)</span> : ''}</div>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => moveLeft(sv)}
                                                        disabled={sv.HasScores}
                                                        className="p-1.5 text-[#EF4444] bg-[#EF4444]/10 rounded hover:bg-[#EF4444] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title={sv.HasScores ? "Không thể loại SV đã có điểm" : "Loại khỏi lớp"}
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Modal Footer */}
                <div className="p-5 border-t border-surface-hover bg-[#191b23] flex justify-between items-center">
                    <span className="text-sm text-text-muted flex items-center gap-2">
                        <AlertTriangle size={16} className="text-[#df7412]" /> 
                        Bạn phải nhấn Lưu Danh Sách thì kết quả xếp lớp mới được áp dụng.
                    </span>
                    <div className="flex gap-3">
                        <button onClick={() => setIsEnrollModalOpen(false)} className="px-5 py-2 border border-surface-hover text-text-muted font-semibold rounded-lg hover:bg-surface-hover transition-colors">
                            Hủy
                        </button>
                        <button 
                            onClick={handleSaveEnrollment} 
                            disabled={isSavingEnrollment}
                            className="px-6 py-2 bg-[#10B981] text-white font-semibold rounded-lg hover:bg-[#10B981]/90 transition-colors shadow-lg shadow-[#10B981]/20 flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSavingEnrollment ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Lưu Danh Sách
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* 5. Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-hover rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-surface-hover">
              <h3 className="text-xl font-bold text-text-primary">{editingLHP ? 'Cập nhật Lớp Học Phần' : 'Thêm Lớp Học Phần Mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-[#EF4444] transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="lhpForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Mã LHP</label>
                    <input type="text" required disabled={!!editingLHP} className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary text-sm focus:border-primary outline-none disabled:opacity-50" value={formData.MaLHP} onChange={(e) => setFormData({...formData, MaLHP: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Tên Lớp HP</label>
                    <input type="text" required className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary text-sm focus:border-primary outline-none" placeholder="VD: Lập trình Web - Nhóm 1" value={formData.TenLopHP} onChange={(e) => setFormData({...formData, TenLopHP: e.target.value})} />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Lọc theo Khoa</label>
                    <select className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary text-sm focus:border-primary outline-none" value={modalKhoaFilter} onChange={(e) => {
                      setModalKhoaFilter(e.target.value);
                      setFormData({...formData, MaMon: ''});
                    }}>
                      <option value="">Tất cả Khoa</option>
                      {khoas.map(k => <option key={k.MaKhoa} value={k.MaKhoa}>{k.TenKhoa}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Môn Học</label>
                    <select className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary text-sm focus:border-primary outline-none" value={formData.MaMon} onChange={(e) => setFormData({...formData, MaMon: e.target.value})}>
                      <option value="" disabled>Chọn Môn học...</option>
                      {Array.isArray(monHocs) && monHocs
                        .filter(mh => !modalKhoaFilter || mh.MaKhoa === modalKhoaFilter)
                        .map(mh => (
                        <option key={mh.MaMon} value={mh.MaMon}>{mh.TenMon}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Giảng Viên Phụ Trách</label>
                    <select className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary text-sm focus:border-primary outline-none" value={formData.MaGV} onChange={(e) => setFormData({...formData, MaGV: e.target.value})}>
                      <option value="" disabled>Chọn Giảng viên...</option>
                      {Array.isArray(giangViens) && giangViens.map(gv => (
                        <option key={gv.MaGV} value={gv.MaGV}>{gv.HoTen}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Học Kỳ</label>
                    <select className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary text-sm focus:border-primary outline-none" value={formData.MaHK} onChange={(e) => setFormData({...formData, MaHK: e.target.value})}>
                      <option value="" disabled>Chọn Học kỳ...</option>
                      {Array.isArray(hocKys) && hocKys.map(hk => (
                        <option key={hk.MaHK} value={hk.MaHK}>{hk.TenHK} ({hk.NamBatDau}-{hk.NamKetThuc})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Sĩ Số Tối Đa</label>
                    <input type="number" min="1" max="200" required className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary text-sm focus:border-primary outline-none" value={formData.SiSoToiDa} onChange={(e) => setFormData({...formData, SiSoToiDa: e.target.value})} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Phòng Học</label>
                    <input type="text" className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary text-sm focus:border-primary outline-none" value={formData.PhongHoc} onChange={(e) => setFormData({...formData, PhongHoc: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Trạng Thái</label>
                    <select className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary text-sm focus:border-primary outline-none" value={formData.TrangThai} onChange={(e) => setFormData({...formData, TrangThai: e.target.value})}>
                      <option value="Chờ mở đăng ký">Chờ mở đăng ký</option>
                      <option value="MoDangKy">Đang mở</option>
                      <option value="Đã chốt">Đã chốt</option>
                      <option value="Hủy">Hủy</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-surface-hover flex gap-3 justify-end bg-[#191b23] mt-auto">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg font-medium border border-surface-hover text-text-muted hover:bg-surface-hover transition-colors text-sm">Hủy</button>
              <button type="submit" form="lhpForm" className="px-5 py-2.5 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 text-sm flex items-center gap-2">
                <Plus size={16} /> Lưu dữ liệu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Excel Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-surface-hover shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-surface-hover">
              <h2 className="text-xl font-bold text-text-primary">Xem trước dữ liệu Excel</h2>
              <button onClick={() => setIsPreviewModalOpen(false)} className="text-text-muted hover:text-[#EF4444] p-1 rounded transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#191b23] text-text-muted uppercase text-[11px] tracking-wider border-b border-surface-hover">
                    <th className="p-4 font-semibold">Mã LHP</th>
                    <th className="p-4 font-semibold">Tên Lớp HP</th>
                    <th className="p-4 font-semibold">Mã Môn</th>
                    <th className="p-4 font-semibold">Mã GV</th>
                    <th className="p-4 font-semibold">Mã HK</th>
                    <th className="p-4 font-semibold">Sĩ số TĐ</th>
                  </tr>
                </thead>
                <tbody className="text-text-primary text-sm divide-y divide-surface-hover">
                  {excelPreviewData.map((row, idx) => (
                    <tr key={idx} className={`transition-colors ${row.isDuplicate ? 'bg-[#EF4444]/10 text-[#EF4444]' : 'hover:bg-surface-hover/50'}`}>
                      <td className="p-4 font-medium">
                        {row.MaLHP}
                        {row.isDuplicate && <span className="ml-2 text-[10px] bg-[#EF4444] text-white px-1.5 py-0.5 rounded uppercase font-bold">Trùng</span>}
                      </td>
                      <td className="p-4">{row.TenLopHP}</td>
                      <td className="p-4">{row.MaMon}</td>
                      <td className="p-4">{row.MaGV}</td>
                      <td className="p-4">{row.MaHK}</td>
                      <td className="p-4">{row.SiSoToiDa}</td>
                    </tr>
                  ))}
                  {excelPreviewData.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-text-muted">Không có dữ liệu hợp lệ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center p-6 border-t border-surface-hover bg-[#191b23]">
               <div className="flex flex-col">
                  <span className="text-sm text-text-muted">Tổng cộng: <strong className="text-text-primary">{excelPreviewData.length}</strong> dòng</span>
                  <span className="text-sm text-[#10B981]">Hợp lệ: <strong>{excelPreviewData.filter(r => !r.isDuplicate).length}</strong></span>
               </div>
               <div className="flex gap-3">
                 <button onClick={() => setIsPreviewModalOpen(false)} className="px-5 py-2.5 rounded-lg font-medium text-text-muted hover:bg-surface-hover border border-transparent transition-colors text-sm">
                  Hủy
                 </button>
                 <button 
                  onClick={confirmImportExcel}
                  disabled={isImporting || excelPreviewData.filter(r => !r.isDuplicate).length === 0}
                  className="px-5 py-2.5 rounded-lg font-medium bg-[#10B981] text-white hover:bg-[#10B981]/90 transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2 text-sm"
                 >
                  {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  Xác nhận Nhập
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-surface-hover shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-surface-hover bg-[#191b23]">
              <div>
                <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <Eye size={20} className="text-[#10B981]" /> Chi tiết Lớp Học Phần
                </h3>
                <p className="text-text-muted text-sm mt-1">{viewedClassDetails?.TenLopHP} - {viewedClassDetails?.MaLHP}</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 text-text-muted hover:text-[#EF4444] hover:bg-surface-hover rounded transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-auto flex-1">
                {loadingView ? (
                    <div className="flex items-center justify-center h-40 text-text-muted flex-col gap-3">
                        <Loader2 className="animate-spin" size={32} />
                        <span>Đang tải danh sách sinh viên...</span>
                    </div>
                ) : (
                    <div>
                        <div className="mb-4 text-sm text-text-muted flex justify-between">
                            <span>Môn học: <strong className="text-text-primary">{viewedClassDetails?.MonHoc?.TenMon}</strong></span>
                            <span>Giảng viên: <strong className="text-text-primary">{viewedClassDetails?.GiangVien?.HoTen}</strong></span>
                        </div>
                        <table className="w-full text-left border-collapse border border-surface-hover rounded-lg overflow-hidden">
                            <thead>
                            <tr className="bg-[#191b23] text-text-muted uppercase text-[11px] tracking-wider border-b border-surface-hover">
                                <th className="p-3 font-semibold text-center w-12">STT</th>
                                <th className="p-3 font-semibold">Mã SV</th>
                                <th className="p-3 font-semibold">Họ tên</th>
                                <th className="p-3 font-semibold">Lớp</th>
                            </tr>
                            </thead>
                            <tbody className="text-text-primary text-sm divide-y divide-surface-hover">
                            {viewedClassDetails?.students?.length > 0 ? (
                                viewedClassDetails.students.map((sv, idx) => (
                                <tr key={sv.MaSV} className="hover:bg-surface-hover/50 transition-colors">
                                    <td className="p-3 text-text-muted text-center">{idx + 1}</td>
                                    <td className="p-3 font-medium">{sv.MaSV}</td>
                                    <td className="p-3">{sv.HoTen}</td>
                                    <td className="p-3">{sv.MaLop}</td>
                                </tr>
                                ))
                            ) : (
                                <tr>
                                <td colSpan="4" className="p-8 text-center text-text-muted">Chưa có sinh viên nào trong lớp</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL QUẢN LÝ HỌC KỲ */}
      {isHkModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-4xl shadow-2xl border border-surface-hover overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-surface-hover bg-canvas">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <CalendarDays className="text-primary" /> Quản lý Học Kỳ
              </h2>
              <button onClick={() => setIsHkModalOpen(false)} className="text-text-muted hover:text-semantic-error transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* Form Add/Edit */}
              <div className="w-full lg:w-1/3 p-6 border-b lg:border-b-0 lg:border-r border-surface-hover bg-canvas/50 overflow-y-auto">
                <h3 className="font-semibold text-text-primary mb-4">
                  {editingHk ? 'Sửa Học Kỳ' : 'Thêm Học Kỳ Mới'}
                </h3>
                <form onSubmit={handleSubmitHk} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Mã Học Kỳ *</label>
                    <input type="text" required disabled={!!editingHk} placeholder="VD: HK1_2526"
                      value={hkForm.MaHK} onChange={(e) => setHkForm({...hkForm, MaHK: e.target.value})}
                      className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Tên Học Kỳ *</label>
                    <input type="text" required placeholder="VD: Học Kỳ 1"
                      value={hkForm.TenHK} onChange={(e) => setHkForm({...hkForm, TenHK: e.target.value})}
                      className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-1">Năm Bắt Đầu *</label>
                      <input type="number" required min="2000" max="2100"
                        value={hkForm.NamBatDau} onChange={(e) => setHkForm({...hkForm, NamBatDau: parseInt(e.target.value)})}
                        className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-1">Năm Kết Thúc *</label>
                      <input type="number" required min="2000" max="2100"
                        value={hkForm.NamKetThuc} onChange={(e) => setHkForm({...hkForm, NamKetThuc: parseInt(e.target.value)})}
                        className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none" />
                    </div>
                  </div>
                  <div className="pt-2 flex gap-2">
                    {editingHk && (
                      <button type="button" onClick={() => handleOpenHkModal(null)} className="flex-1 px-4 py-2 rounded-lg font-medium border border-surface-hover text-text-muted hover:bg-surface-hover transition-colors">
                        Hủy Sửa
                      </button>
                    )}
                    <button type="submit" className="flex-1 px-4 py-2 rounded-lg font-medium bg-primary text-white hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
                      {editingHk ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                  </div>
                </form>
              </div>

              {/* List */}
              <div className="w-full lg:w-2/3 flex flex-col p-6 overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input type="text" placeholder="Tìm Mã/Tên HK..." value={searchHk} onChange={e => setSearchHk(e.target.value)}
                      className="w-full bg-canvas border border-surface-hover rounded-lg pl-9 pr-4 py-2 text-text-primary text-sm focus:border-primary outline-none transition-colors" />
                  </div>
                  <select value={filterHkYear} onChange={e => setFilterHkYear(e.target.value)}
                    className="bg-canvas border border-surface-hover rounded-lg px-3 py-2 text-text-primary text-sm focus:border-primary outline-none transition-colors sm:w-40">
                    <option value="">Tất cả Năm</option>
                    {uniqueYears.map(y => <option key={y} value={y}>Năm {y}</option>)}
                  </select>
                </div>

                <div className="flex-1 overflow-y-auto border border-surface-hover rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#191b23] z-10 border-b border-surface-hover">
                      <tr className="text-text-muted text-xs uppercase tracking-wider">
                        <th className="px-4 py-3 font-semibold">Mã HK</th>
                        <th className="px-4 py-3 font-semibold">Tên Học Kỳ</th>
                        <th className="px-4 py-3 font-semibold text-center">Năm Học</th>
                        <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#32353c]">
                      {filteredHocKys.length === 0 ? (
                        <tr><td colSpan="4" className="text-center py-8 text-text-muted">Không tìm thấy học kỳ nào</td></tr>
                      ) : (
                        filteredHocKys.map((hk) => (
                          <tr key={hk.MaHK} className="hover:bg-surface-hover/30 transition-colors">
                            <td className="px-4 py-3 text-text-primary font-medium">{hk.MaHK}</td>
                            <td className="px-4 py-3 text-text-primary">{hk.TenHK}</td>
                            <td className="px-4 py-3 text-center text-text-muted">{hk.NamBatDau} - {hk.NamKetThuc}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => handleOpenHkModal(hk)} className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Sửa">
                                  <Edit size={16} />
                                </button>
                                <button onClick={() => handleDeleteHk(hk.MaHK)} className="p-1.5 text-text-muted hover:text-semantic-error hover:bg-semantic-error/10 rounded-md transition-colors" title="Xóa">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import { Plus, Edit, Trash2, X, Upload, Download, Loader2, Search, Building, Save, AlertTriangle, Layers, LibraryBig } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function LopHanhChinh() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterKhoa, setFilterKhoa] = useState('');

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [khoas, setKhoas] = useState([]);
  const [nganhs, setNganhs] = useState([]);
  const [giangViens, setGiangViens] = useState([]);

  // Excel State
  const fileInputRef = useRef(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [excelPreviewData, setExcelPreviewData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [excelError, setExcelError] = useState('');

  // Modals state
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isNganhModalOpen, setIsNganhModalOpen] = useState(false);
  const [isKhoaModalOpen, setIsKhoaModalOpen] = useState(false);

  // Forms state
  const [editingClass, setEditingClass] = useState(null);
  const [classForm, setClassForm] = useState({ MaLop: '', TenLop: '', NienKhoa: '', MaNganh: '', MaGVCN: '' });
  const [classError, setClassError] = useState('');

  const [nganhForm, setNganhForm] = useState({ MaNganh: '', TenNganh: '', MaKhoa: '' });
  const [editingNganh, setEditingNganh] = useState(null);
  const [nganhError, setNganhError] = useState('');

  const [khoaForm, setKhoaForm] = useState({ MaKhoa: '', TenKhoa: '' });
  const [editingKhoa, setEditingKhoa] = useState(null);
  const [khoaError, setKhoaError] = useState('');

  // Fetch init data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [clsRes, khoasRes, nganhsRes, gvRes] = await Promise.all([
        axiosClient.get('/lophanhchinh'),
        axiosClient.get('/khoa'),
        axiosClient.get('/nganh'),
        axiosClient.get('/giangvien')
      ]);
      setClasses(clsRes.data || []);
      setKhoas(khoasRes.data || []);
      setNganhs(nganhsRes.data || []);
      setGiangViens(gvRes.data || []);
    } catch (err) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter logic
  const filteredClasses = classes.filter(c => {
    const matchSearch = (c.MaLop || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (c.TenLop || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchKhoa = filterKhoa ? c.Nganh?.Khoa?.MaKhoa === filterKhoa : true;
    return matchSearch && matchKhoa;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterKhoa]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClasses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // --- Excel Handlers ---
  const handleExportExcel = () => {
    const dataToExport = classes.map(cls => ({
      'Mã Lớp': cls.MaLop,
      'Tên Lớp': cls.TenLop,
      'Niên Khóa': cls.NienKhoa,
      'Mã Ngành': cls.MaNganh,
      'Mã GVCN': cls.MaGVCN
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LopHanhChinh');
    XLSX.writeFile(workbook, 'DanhSachLopHanhChinh.xlsx');
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
      
      const existingMaLop = new Set(classes.map(c => String(c.MaLop).trim().toLowerCase()));
      const seenInExcel = new Set();

      const formattedData = data.map(row => {
        const maLopStr = String(row['Mã Lớp'] || '').trim();
        const lowerMaLop = maLopStr.toLowerCase();
        
        let isDuplicate = false;
        if (!maLopStr) isDuplicate = true;
        else if (existingMaLop.has(lowerMaLop) || seenInExcel.has(lowerMaLop)) isDuplicate = true;
        else seenInExcel.add(lowerMaLop);

        return {
          MaLop: maLopStr,
          TenLop: row['Tên Lớp'] || '',
          NienKhoa: row['Niên Khóa'] ? String(row['Niên Khóa']) : null,
          MaNganh: row['Mã Ngành'] ? String(row['Mã Ngành']) : null,
          MaGVCN: row['Mã GVCN'] ? String(row['Mã GVCN']) : null,
          isDuplicate
        };
      });

      setExcelPreviewData(formattedData);
      setExcelError('');
      setIsPreviewModalOpen(true);
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const confirmImportExcel = async () => {
    try {
      setIsImporting(true);
      setExcelError('');
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

      await axiosClient.post('/lophanhchinh/bulk', payload);
      toast.success(`Đã nhập thành công ${payload.length} dòng dữ liệu!`);
      setIsPreviewModalOpen(false);
      fetchData();
    } catch (err) {
      setExcelError(err.response?.data?.message || 'Có lỗi xảy ra khi nhập Excel');
    } finally {
      setIsImporting(false);
    }
  };

  // --- Class Handlers ---
  const handleOpenClassModal = (cls = null) => {
    setClassError('');
    if (cls) {
      setEditingClass(cls);
      setClassForm({ MaLop: cls.MaLop, TenLop: cls.TenLop, NienKhoa: cls.NienKhoa || '', MaNganh: cls.MaNganh || '', MaGVCN: cls.MaGVCN || '' });
    } else {
      setEditingClass(null);
      setClassForm({ MaLop: '', TenLop: '', NienKhoa: '', MaNganh: nganhs.length > 0 ? nganhs[0].MaNganh : '', MaGVCN: '' });
    }
    setIsClassModalOpen(true);
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    setClassError('');
    try {
      if (editingClass) {
        await axiosClient.put(`/lophanhchinh/${editingClass.MaLop}`, classForm);
        toast.success('Cập nhật lớp thành công');
      } else {
        await axiosClient.post('/lophanhchinh', classForm);
        toast.success('Thêm lớp mới thành công');
      }
      setIsClassModalOpen(false);
      fetchData();
    } catch (err) {
      setClassError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu Lớp');
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa Lớp này?')) return;
    try {
      await axiosClient.delete(`/lophanhchinh/${id}`);
      toast.success('Đã xóa lớp');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa Lớp này');
    }
  };

  // --- Nganh Handlers ---
  const handleOpenNganhModal = () => {
    setNganhError('');
    setEditingNganh(null);
    setNganhForm({ MaNganh: '', TenNganh: '', MaKhoa: khoas.length > 0 ? khoas[0].MaKhoa : '' });
    setIsNganhModalOpen(true);
  };

  const handleSaveNganh = async (e) => {
    e.preventDefault();
    setNganhError('');
    try {
      if (editingNganh) {
        await axiosClient.put(`/nganh/${editingNganh.MaNganh}`, nganhForm);
        toast.success('Cập nhật Ngành thành công');
      } else {
        await axiosClient.post('/nganh', nganhForm);
        toast.success('Thêm Ngành thành công');
      }
      setNganhForm({ MaNganh: '', TenNganh: '', MaKhoa: khoas.length > 0 ? khoas[0].MaKhoa : '' });
      setEditingNganh(null);
      fetchData(); // reload lists
    } catch (err) {
      setNganhError(err.response?.data?.message || 'Lỗi khi lưu Ngành');
    }
  };

  const handleDeleteNganh = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa Ngành này?')) return;
    try {
      await axiosClient.delete(`/nganh/${id}`);
      toast.success('Đã xóa Ngành');
      fetchData();
    } catch (err) {
      setNganhError(err.response?.data?.message || 'Không thể xóa Ngành');
    }
  };

  const editNganhClick = (n) => {
    setNganhError('');
    setEditingNganh(n);
    setNganhForm({ MaNganh: n.MaNganh, TenNganh: n.TenNganh, MaKhoa: n.MaKhoa });
  };

  // --- Khoa Handlers ---
  const handleOpenKhoaModal = () => {
    setKhoaError('');
    setEditingKhoa(null);
    setKhoaForm({ MaKhoa: '', TenKhoa: '' });
    setIsKhoaModalOpen(true);
  };

  const handleSaveKhoa = async (e) => {
    e.preventDefault();
    setKhoaError('');
    try {
      if (editingKhoa) {
        await axiosClient.put(`/khoa/${editingKhoa.MaKhoa}`, khoaForm);
        toast.success('Cập nhật Khoa thành công');
      } else {
        await axiosClient.post('/khoa', khoaForm);
        toast.success('Thêm Khoa thành công');
      }
      setKhoaForm({ MaKhoa: '', TenKhoa: '' });
      setEditingKhoa(null);
      fetchData();
    } catch (err) {
      setKhoaError(err.response?.data?.message || 'Lỗi khi lưu Khoa');
    }
  };

  const handleDeleteKhoa = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa Khoa này?')) return;
    try {
      await axiosClient.delete(`/khoa/${id}`);
      toast.success('Đã xóa Khoa');
      fetchData();
    } catch (err) {
      setKhoaError(err.response?.data?.message || 'Không thể xóa Khoa');
    }
  };

  const editKhoaClick = (k) => {
    setKhoaError('');
    setEditingKhoa(k);
    setKhoaForm({ MaKhoa: k.MaKhoa, TenKhoa: k.TenKhoa });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="text-text-muted text-sm mb-2 font-medium">Trang chủ &gt; Lớp hành chính</div>
        <h2 className="text-3xl font-bold text-text-primary">Quản lý Lớp Hành Chính</h2>
      </div>

      {/* Top Bar */}
      <div className="bg-surface rounded-xl border border-surface-hover p-4 mb-6 flex flex-col xl:flex-row justify-between gap-4">
        {/* Left filters & buttons */}
        <div className="flex flex-wrap gap-3 items-center">
            <select value={filterKhoa} onChange={e => setFilterKhoa(e.target.value)}
                className="bg-canvas border border-surface-hover rounded-lg px-3 py-2.5 text-text-primary text-sm focus:border-primary outline-none transition-colors">
                <option value="">Tất cả Khoa</option>
                {khoas.map(k => <option key={k.MaKhoa} value={k.MaKhoa}>{k.TenKhoa}</option>)}
            </select>
            <div className="relative w-full md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" placeholder="Tìm kiếm Tên/Mã Lớp..."
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-canvas border border-surface-hover rounded-lg pl-9 pr-4 py-2.5 text-text-primary text-sm focus:border-primary outline-none transition-colors" />
            </div>

            <div className="h-8 w-px bg-surface-hover mx-2 hidden md:block"></div>

            <button onClick={handleOpenKhoaModal} className="flex items-center gap-1.5 px-3 py-2.5 rounded font-medium border border-[#df7412]/30 text-[#df7412] hover:bg-[#df7412]/10 transition-colors text-sm">
                <LibraryBig size={16} /> Quản lý Khoa
            </button>
            <button onClick={handleOpenNganhModal} className="flex items-center gap-1.5 px-3 py-2.5 rounded font-medium border border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/10 transition-colors text-sm">
                <Layers size={16} /> Quản lý Ngành
            </button>
        </div>
        
        {/* Right actions */}
        <div className="flex flex-wrap gap-2 items-center">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" className="hidden" />
            <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-1.5 px-3 py-2 rounded font-medium border border-surface-hover text-text-muted hover:border-primary hover:text-primary transition-colors text-sm">
                <Upload size={16} /> Nhập Excel
            </button>
            <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-2 rounded font-medium border border-surface-hover text-text-muted hover:border-[#10B981] hover:text-[#10B981] transition-colors text-sm">
                <Download size={16} /> Xuất Excel
            </button>
            <button onClick={() => handleOpenClassModal()} className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 text-sm">
                <Plus size={16} /> Thêm Lớp Mới
            </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-surface rounded-xl border border-surface-hover overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#191b23] border-b border-surface-hover text-text-muted text-[11px] uppercase tracking-wider">
                <th className="px-5 py-4 font-semibold">Mã Lớp</th>
                <th className="px-5 py-4 font-semibold">Tên Lớp</th>
                <th className="px-5 py-4 font-semibold">Niên Khóa</th>
                <th className="px-5 py-4 font-semibold">Ngành</th>
                <th className="px-5 py-4 font-semibold">Cố vấn học tập</th>
                <th className="px-5 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-hover">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12 text-text-muted"><Loader2 className="animate-spin inline mr-2" /> Đang tải...</td></tr>
              ) : filteredClasses.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-text-muted">Không tìm thấy lớp hành chính nào</td></tr>
              ) : (
                currentItems.map((cls) => (
                  <tr key={cls.MaLop} className="hover:bg-surface-hover/50 transition-colors group">
                    <td className="px-5 py-4 text-text-primary font-medium text-sm">{cls.MaLop}</td>
                    <td className="px-5 py-4 text-text-primary text-sm">{cls.TenLop}</td>
                    <td className="px-5 py-4 text-text-muted text-sm">{cls.NienKhoa}</td>
                    <td className="px-5 py-4 text-text-muted text-sm">{cls.Nganh?.TenNganh || cls.MaNganh}</td>
                    <td className="px-5 py-4 text-text-muted text-sm">{cls.GiangVien?.HoTen || cls.MaGVCN || 'Chưa phân công'}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleOpenClassModal(cls)} className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Chỉnh sửa">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteClass(cls.MaLop)} className="p-1.5 text-text-muted hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 rounded transition-colors" title="Xóa">
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
                    Hiển thị {indexOfFirstItem + 1} đến {Math.min(indexOfLastItem, filteredClasses.length)} trong tổng số {filteredClasses.length} lớp
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

      {/* 1. Modal Thêm/Sửa Lớp (z-50) */}
      {isClassModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col border border-surface-hover overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-surface-hover bg-[#191b23]">
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Building size={20} className="text-primary" /> {editingClass ? 'Cập nhật Lớp Hành Chính' : 'Thêm Lớp Mới'}
              </h3>
              <button onClick={() => setIsClassModalOpen(false)} className="text-text-muted hover:text-[#ffb4ab] transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {classError && (
                <div className="mb-4 p-3 rounded-lg bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 flex items-center gap-3">
                    <AlertTriangle className="text-[#ffb4ab]" size={20} />
                    <span className="text-[#ffb4ab] text-sm font-medium">{classError}</span>
                </div>
              )}

              <form id="classForm" onSubmit={handleSaveClass} className="space-y-4">
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Mã Lớp</label>
                    <input type="text" required disabled={!!editingClass} className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary text-sm focus:border-primary outline-none disabled:opacity-50" value={classForm.MaLop} onChange={e => setClassForm({...classForm, MaLop: e.target.value})} />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Tên Lớp</label>
                    <input type="text" required className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary text-sm focus:border-primary outline-none" value={classForm.TenLop} onChange={e => setClassForm({...classForm, TenLop: e.target.value})} />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Niên Khóa</label>
                    <input type="text" className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary text-sm focus:border-primary outline-none" placeholder="VD: 2023-2027" value={classForm.NienKhoa} onChange={e => setClassForm({...classForm, NienKhoa: e.target.value})} />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Ngành Đào Tạo</label>
                    <select required className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary text-sm focus:border-primary outline-none" value={classForm.MaNganh} onChange={e => setClassForm({...classForm, MaNganh: e.target.value})}>
                      <option value="" disabled>Chọn Ngành...</option>
                      {nganhs.map(n => <option key={n.MaNganh} value={n.MaNganh}>{n.TenNganh}</option>)}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Cố vấn học tập (GVCN)</label>
                    <select className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary text-sm focus:border-primary outline-none" value={classForm.MaGVCN} onChange={e => setClassForm({...classForm, MaGVCN: e.target.value})}>
                      <option value="">Không phân công</option>
                      {giangViens.map(gv => <option key={gv.MaGV} value={gv.MaGV}>{gv.HoTen}</option>)}
                    </select>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-surface-hover flex gap-3 justify-end bg-[#191b23]">
              <button onClick={() => setIsClassModalOpen(false)} className="px-5 py-2.5 rounded-lg font-medium border border-surface-hover text-text-muted hover:bg-surface-hover transition-colors text-sm">Hủy</button>
              <button type="submit" form="classForm" className="px-5 py-2.5 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 text-sm flex items-center gap-2">
                <Save size={16} /> Lưu dữ liệu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Quản Lý Ngành (z-60) */}
      {isNganhModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col border border-surface-hover overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-surface-hover bg-[#191b23]">
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Layers size={20} className="text-[#10B981]" /> Quản lý Ngành Đào Tạo
              </h3>
              <button onClick={() => setIsNganhModalOpen(false)} className="text-text-muted hover:text-[#ffb4ab] transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              {nganhError && (
                <div className="p-3 rounded-lg bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 flex items-center gap-3">
                    <AlertTriangle className="text-[#ffb4ab]" size={20} />
                    <span className="text-[#ffb4ab] text-sm font-medium">{nganhError}</span>
                </div>
              )}

              {/* Nganh Form */}
              <form onSubmit={handleSaveNganh} className="bg-canvas p-4 rounded-xl border border-surface-hover flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Mã Ngành</label>
                  <input type="text" required disabled={!!editingNganh} className="w-full bg-surface border border-surface-hover rounded-lg px-3 py-2 text-text-primary text-sm focus:border-primary outline-none disabled:opacity-50" value={nganhForm.MaNganh} onChange={e => setNganhForm({...nganhForm, MaNganh: e.target.value})} />
                </div>
                <div className="flex-[2] min-w-[200px]">
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Tên Ngành</label>
                  <input type="text" required className="w-full bg-surface border border-surface-hover rounded-lg px-3 py-2 text-text-primary text-sm focus:border-primary outline-none" value={nganhForm.TenNganh} onChange={e => setNganhForm({...nganhForm, TenNganh: e.target.value})} />
                </div>
                <div className="flex-[2] min-w-[200px]">
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Thuộc Khoa</label>
                  <select required className="w-full bg-surface border border-surface-hover rounded-lg px-3 py-2 text-text-primary text-sm focus:border-primary outline-none" value={nganhForm.MaKhoa} onChange={e => setNganhForm({...nganhForm, MaKhoa: e.target.value})}>
                    <option value="" disabled>Chọn Khoa...</option>
                    {khoas.map(k => <option key={k.MaKhoa} value={k.MaKhoa}>{k.TenKhoa}</option>)}
                  </select>
                </div>
                <button type="submit" className="px-4 py-2 bg-[#10B981] text-white text-sm font-medium rounded-lg hover:bg-[#10B981]/90 transition-colors">
                  {editingNganh ? 'Cập nhật' : 'Thêm Ngành'}
                </button>
                {editingNganh && (
                  <button type="button" onClick={() => { setEditingNganh(null); setNganhForm({ MaNganh:'', TenNganh:'', MaKhoa:''}); setNganhError(''); }} className="px-4 py-2 border border-surface-hover text-text-muted text-sm font-medium rounded-lg hover:bg-surface-hover transition-colors">
                    Hủy sửa
                  </button>
                )}
              </form>

              {/* Nganh List */}
              <div className="border border-surface-hover rounded-lg overflow-hidden">
                <div className="overflow-y-auto max-h-[300px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#191b23] z-10 border-b border-surface-hover text-text-muted text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Mã Ngành</th>
                        <th className="px-4 py-3 font-semibold">Tên Ngành</th>
                        <th className="px-4 py-3 font-semibold">Khoa</th>
                        <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-hover bg-surface">
                      {nganhs.map(n => (
                        <tr key={n.MaNganh} className="hover:bg-surface-hover/50 transition-colors">
                          <td className="px-4 py-2.5 text-text-primary text-sm font-medium">{n.MaNganh}</td>
                          <td className="px-4 py-2.5 text-text-primary text-sm">{n.TenNganh}</td>
                          <td className="px-4 py-2.5 text-text-muted text-sm">{n.Khoa?.TenKhoa || n.MaKhoa}</td>
                          <td className="px-4 py-2.5 text-right">
                            <button onClick={() => editNganhClick(n)} className="p-1 text-text-muted hover:text-primary transition-colors mr-1"><Edit size={14}/></button>
                            <button onClick={() => handleDeleteNganh(n.MaNganh)} className="p-1 text-text-muted hover:text-[#ffb4ab] transition-colors"><Trash2 size={14}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Quản Lý Khoa (z-70) */}
      {isKhoaModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col border border-surface-hover overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-surface-hover bg-[#191b23]">
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <LibraryBig size={20} className="text-[#df7412]" /> Quản lý Khoa
              </h3>
              <button onClick={() => setIsKhoaModalOpen(false)} className="text-text-muted hover:text-[#ffb4ab] transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              {khoaError && (
                <div className="p-3 rounded-lg bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 flex items-center gap-3">
                    <AlertTriangle className="text-[#ffb4ab]" size={20} />
                    <span className="text-[#ffb4ab] text-sm font-medium">{khoaError}</span>
                </div>
              )}

              {/* Khoa Form */}
              <form onSubmit={handleSaveKhoa} className="bg-canvas p-4 rounded-xl border border-surface-hover flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Mã Khoa</label>
                  <input type="text" required disabled={!!editingKhoa} className="w-full bg-surface border border-surface-hover rounded-lg px-3 py-2 text-text-primary text-sm focus:border-primary outline-none disabled:opacity-50" value={khoaForm.MaKhoa} onChange={e => setKhoaForm({...khoaForm, MaKhoa: e.target.value})} />
                </div>
                <div className="flex-[2] min-w-[200px]">
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Tên Khoa</label>
                  <input type="text" required className="w-full bg-surface border border-surface-hover rounded-lg px-3 py-2 text-text-primary text-sm focus:border-primary outline-none" value={khoaForm.TenKhoa} onChange={e => setKhoaForm({...khoaForm, TenKhoa: e.target.value})} />
                </div>
                <button type="submit" className="px-4 py-2 bg-[#df7412] text-white text-sm font-medium rounded-lg hover:bg-[#df7412]/90 transition-colors">
                  {editingKhoa ? 'Cập nhật' : 'Thêm Khoa'}
                </button>
                {editingKhoa && (
                  <button type="button" onClick={() => { setEditingKhoa(null); setKhoaForm({ MaKhoa:'', TenKhoa:''}); setKhoaError(''); }} className="px-4 py-2 border border-surface-hover text-text-muted text-sm font-medium rounded-lg hover:bg-surface-hover transition-colors">
                    Hủy sửa
                  </button>
                )}
              </form>

              {/* Khoa List */}
              <div className="border border-surface-hover rounded-lg overflow-hidden">
                <div className="overflow-y-auto max-h-[250px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#191b23] z-10 border-b border-surface-hover text-text-muted text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Mã Khoa</th>
                        <th className="px-4 py-3 font-semibold">Tên Khoa</th>
                        <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-hover bg-surface">
                      {khoas.map(k => (
                        <tr key={k.MaKhoa} className="hover:bg-surface-hover/50 transition-colors">
                          <td className="px-4 py-2.5 text-text-primary text-sm font-medium">{k.MaKhoa}</td>
                          <td className="px-4 py-2.5 text-text-primary text-sm">{k.TenKhoa}</td>
                          <td className="px-4 py-2.5 text-right">
                            <button onClick={() => editKhoaClick(k)} className="p-1 text-text-muted hover:text-primary transition-colors mr-1"><Edit size={14}/></button>
                            <button onClick={() => handleDeleteKhoa(k.MaKhoa)} className="p-1 text-text-muted hover:text-[#ffb4ab] transition-colors"><Trash2 size={14}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Excel Preview Modal */}
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
              {excelError && (
                <div className="mb-4 p-4 rounded-xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 flex items-start gap-3">
                    <AlertTriangle className="text-[#ffb4ab] shrink-0 mt-0.5" size={20} />
                    <div className="text-[#ffb4ab] text-sm whitespace-pre-wrap font-medium flex-1">
                        {excelError}
                    </div>
                </div>
              )}

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#191b23] text-text-muted uppercase text-[11px] tracking-wider border-b border-surface-hover">
                    <th className="p-4 font-semibold">Mã Lớp</th>
                    <th className="p-4 font-semibold">Tên Lớp</th>
                    <th className="p-4 font-semibold">Niên Khóa</th>
                    <th className="p-4 font-semibold">Mã Ngành</th>
                    <th className="p-4 font-semibold">Mã GVCN</th>
                  </tr>
                </thead>
                <tbody className="text-text-primary text-sm divide-y divide-surface-hover">
                  {excelPreviewData.map((row, idx) => (
                    <tr key={idx} className={`transition-colors ${row.isDuplicate ? 'bg-[#EF4444]/10 text-[#EF4444]' : 'hover:bg-surface-hover/50'}`}>
                      <td className="p-4 font-medium">
                        {row.MaLop}
                        {row.isDuplicate && <span className="ml-2 text-[10px] bg-[#EF4444] text-white px-1.5 py-0.5 rounded uppercase font-bold">Trùng</span>}
                      </td>
                      <td className="p-4">{row.TenLop}</td>
                      <td className="p-4">{row.NienKhoa}</td>
                      <td className="p-4">{row.MaNganh}</td>
                      <td className="p-4">{row.MaGVCN}</td>
                    </tr>
                  ))}
                  {excelPreviewData.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-text-muted">Không có dữ liệu hợp lệ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center p-6 border-t border-surface-hover bg-[#191b23]">
               <div className="flex flex-col">
                  <span className="text-sm text-text-muted">Tổng cộng: <strong className="text-text-primary">{excelPreviewData.length}</strong> dòng</span>
                  <span className="text-sm text-[#10B981]">Hợp lệ có thể nhập: <strong>{excelPreviewData.filter(r => !r.isDuplicate).length}</strong></span>
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

    </div>
  );
}

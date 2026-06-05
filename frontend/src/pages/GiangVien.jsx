import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import { Plus, Edit, Trash2, X, Upload, Download, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function GiangVien() {
  const [giangViens, setGiangViens] = useState([]);
  const [khoas, setKhoas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGV, setEditingGV] = useState(null);
  
  const [formData, setFormData] = useState({ 
    MaGV: '', HoTen: '', NgaySinh: '', GioiTinh: 'Nam', 
    Email: '', SDT: '', HocVi: '', MaKhoa: '', CCCD: '' 
  });

  const fileInputRef = useRef(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [excelPreviewData, setExcelPreviewData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  // --- FILTER & SEARCH STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKhoa, setFilterKhoa] = useState('');

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gvRes, khoaRes] = await Promise.all([
        axiosClient.get('/giangvien'),
        axiosClient.get('/khoa')
      ]);
      setGiangViens(gvRes.data);
      setKhoas(khoaRes.data);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu Giảng viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FILTERED DATA ---
  const filteredGiangViens = giangViens.filter(gv => {
    const matchSearch = (gv.MaGV?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         gv.HoTen?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchKhoa = !filterKhoa || gv.MaKhoa === filterKhoa;

    return matchSearch && matchKhoa;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterKhoa]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredGiangViens.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredGiangViens.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // --- EXCEL HANDLERS ---
  const handleExportExcel = () => {
    const dataToExport = giangViens.map(gv => ({
      'Mã GV': gv.MaGV,
      'Họ Tên': gv.HoTen,
      'Ngày Sinh': gv.NgaySinh,
      'Giới Tính': gv.GioiTinh,
      'Học Vị': gv.HocVi,
      'Mã Khoa': gv.MaKhoa,
      'CCCD': gv.CCCD,
      'SĐT': gv.SDT,
      'Email': gv.Email
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'GiangVien');
    XLSX.writeFile(workbook, 'DanhSachGiangVien.xlsx');
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
      
      const existingMaGVs = new Set(giangViens.map(gv => String(gv.MaGV).trim().toLowerCase()));
      const seenInExcel = new Set();

      const formattedData = data.map(row => {
        const maGVStr = String(row['Mã GV'] || '').trim();
        const lowerMaGV = maGVStr.toLowerCase();
        
        let isDuplicate = false;
        if (!maGVStr) {
          isDuplicate = true;
        } else if (existingMaGVs.has(lowerMaGV) || seenInExcel.has(lowerMaGV)) {
          isDuplicate = true;
        } else {
          seenInExcel.add(lowerMaGV);
        }

        return {
          MaGV: maGVStr,
          HoTen: row['Họ Tên'] || '',
          NgaySinh: row['Ngày Sinh'] || null,
          GioiTinh: row['Giới Tính'] || 'Nam',
          HocVi: row['Học Vị'] || null,
          MaKhoa: row['Mã Khoa'] ? String(row['Mã Khoa']) : null,
          CCCD: row['CCCD'] || null,
          SDT: row['SĐT'] ? String(row['SĐT']) : null,
          Email: row['Email'] || null,
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

      await axiosClient.post('/giangvien/bulk', payload);
      toast.success(`Đã nhập thành công ${payload.length} dòng dữ liệu!`);
      setIsPreviewModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi nhập Excel');
    } finally {
      setIsImporting(false);
    }
  };

  const handleOpenModal = (gv = null) => {
    if (gv) {
      setEditingGV(gv);
      setFormData({ 
        MaGV: gv.MaGV, HoTen: gv.HoTen, NgaySinh: gv.NgaySinh || '', 
        GioiTinh: gv.GioiTinh || 'Nam', Email: gv.Email || '', 
        SDT: gv.SDT || '', HocVi: gv.HocVi || '', 
        MaKhoa: gv.MaKhoa || (khoas.length > 0 ? khoas[0].MaKhoa : ''), 
        CCCD: gv.CCCD || ''
      });
    } else {
      setEditingGV(null);
      setFormData({ 
        MaGV: '', HoTen: '', NgaySinh: '', GioiTinh: 'Nam', 
        Email: '', SDT: '', HocVi: '', 
        MaKhoa: khoas.length > 0 ? khoas[0].MaKhoa : '', 
        CCCD: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGV(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      
      if (editingGV) {
        await axiosClient.put(`/giangvien/${editingGV.MaGV}`, payload);
        toast.success('Cập nhật Giảng viên thành công');
      } else {
        await axiosClient.post('/giangvien', payload);
        toast.success('Thêm Giảng viên mới thành công (Mật khẩu: 123456)');
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (maGV) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa Giảng viên này?')) {
      try {
        await axiosClient.delete(`/giangvien/${maGV}`);
        toast.success('Đã xóa Giảng viên');
        fetchData();
      } catch (error) {
        toast.error('Lỗi khi xóa Giảng viên');
      }
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-text-muted text-sm mb-2 font-medium">Trang chủ &gt; Giảng viên</div>
          <h2 className="text-3xl font-bold text-text-primary">Quản lý Giảng Viên</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-4 py-2 rounded font-medium bg-surface text-text-primary border border-surface-hover hover:border-primary hover:text-primary transition-colors">
            <Upload size={18} />
            <span className="hidden sm:inline">Nhập Excel</span>
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 rounded font-medium bg-surface text-text-primary border border-surface-hover hover:border-semantic-success hover:text-semantic-success transition-colors">
            <Download size={18} />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 rounded font-medium bg-primary text-white hover:bg-primary-hover transition-colors">
            <Plus size={18} />
            <span>Thêm mới</span>
          </button>
        </div>
      </div>

      {/* --- TOP BAR (FILTERS) --- */}
      <div className="bg-surface rounded-xl border border-surface-hover p-4 mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-3 items-center w-full">
            <div className="relative w-full md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" placeholder="Tìm kiếm Tên/Mã Giảng viên..."
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-canvas border border-surface-hover rounded-lg pl-9 pr-4 py-2 text-text-primary text-sm focus:border-primary outline-none transition-colors" />
            </div>
            
            <select value={filterKhoa} onChange={e => setFilterKhoa(e.target.value)}
                className="bg-canvas border border-surface-hover rounded-lg px-3 py-2 text-text-primary text-sm focus:border-primary outline-none transition-colors min-w-[180px]">
                <option value="">Tất cả Khoa</option>
                {khoas.map((k) => <option key={k.MaKhoa} value={k.MaKhoa}>{k.TenKhoa}</option>)}
            </select>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-surface-hover overflow-hidden shadow-sm">
        <div className="p-5 border-b border-surface-hover">
           <h3 className="text-lg font-semibold text-text-primary">Danh sách Giảng viên</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-header border-b border-surface-hover text-text-muted text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Mã GV</th>
                <th className="px-6 py-4 font-semibold">Họ Tên</th>
                <th className="px-6 py-4 font-semibold">Ngày Sinh</th>
                <th className="px-6 py-4 font-semibold">Giới Tính</th>
                <th className="px-6 py-4 font-semibold">Học vị</th>
                <th className="px-6 py-4 font-semibold">Khoa</th>
                <th className="px-6 py-4 font-semibold">CCCD</th>
                <th className="px-6 py-4 font-semibold">SĐT</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-hover">
              {loading ? (
                <tr><td colSpan="10" className="text-center py-8 text-text-muted">Đang tải dữ liệu...</td></tr>
              ) : filteredGiangViens.length === 0 ? (
                <tr><td colSpan="10" className="text-center py-8 text-text-muted">Không tìm thấy giảng viên nào</td></tr>
              ) : (
                currentItems.map((gv) => (
                  <tr key={gv.MaGV} className="hover:bg-surface-hover/50 transition-colors group">
                    <td className="px-6 py-4 text-text-primary font-medium">{gv.MaGV}</td>
                    <td className="px-6 py-4 text-text-primary min-w-[150px]">{gv.HoTen}</td>
                    <td className="px-6 py-4 text-text-muted">{gv.NgaySinh || '-'}</td>
                    <td className="px-6 py-4 text-text-muted">{gv.GioiTinh || '-'}</td>
                    <td className="px-6 py-4 text-primary font-semibold">{gv.HocVi || '-'}</td>
                    <td className="px-6 py-4 text-text-muted">{gv.Khoa?.TenKhoa || gv.MaKhoa}</td>
                    <td className="px-6 py-4 text-text-muted">{gv.CCCD || '-'}</td>
                    <td className="px-6 py-4 text-text-muted">{gv.SDT || '-'}</td>
                    <td className="px-6 py-4 text-text-muted">{gv.Email || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 text-text-muted">
                        <button onClick={() => handleOpenModal(gv)} className="p-2 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Chỉnh sửa">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(gv.MaGV)} className="p-2 hover:text-semantic-error hover:bg-semantic-error/10 rounded-lg transition-colors" title="Xóa">
                          <Trash2 size={18} />
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
            <div className="flex justify-between items-center px-6 py-4 border-t border-surface-hover bg-[#191b23] rounded-b-xl">
                <span className="text-sm text-text-muted">
                    Hiển thị {indexOfFirstItem + 1} đến {Math.min(indexOfLastItem, filteredGiangViens.length)} trong tổng số {filteredGiangViens.length} giảng viên
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-hover rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-surface-hover">
              <h3 className="text-xl font-bold text-text-primary">{editingGV ? 'Cập nhật Giảng Viên' : 'Thêm Giảng Viên Mới'}</h3>
              <button onClick={handleCloseModal} className="text-text-muted hover:text-semantic-error transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="gvForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Mã Giảng Viên</label>
                    <input type="text" required disabled={!!editingGV} className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none disabled:opacity-50" value={formData.MaGV} onChange={(e) => setFormData({...formData, MaGV: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Họ Tên</label>
                    <input type="text" required className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none" value={formData.HoTen} onChange={(e) => setFormData({...formData, HoTen: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Ngày Sinh</label>
                    <input type="date" className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none" value={formData.NgaySinh} onChange={(e) => setFormData({...formData, NgaySinh: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Giới Tính</label>
                    <select className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none" value={formData.GioiTinh} onChange={(e) => setFormData({...formData, GioiTinh: e.target.value})}>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Học vị</label>
                    <input type="text" className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none" placeholder="VD: Thạc sĩ, Tiến sĩ" value={formData.HocVi} onChange={(e) => setFormData({...formData, HocVi: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Khoa</label>
                    <select 
                      className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none"
                      value={formData.MaKhoa || ''}
                      onChange={(e) => setFormData({...formData, MaKhoa: e.target.value})}
                    >
                      <option value="" disabled>Chọn Khoa...</option>
                      {Array.isArray(khoas) && khoas.map(k => (
                        <option key={k.MaKhoa} value={k.MaKhoa}>{k.TenKhoa}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Email</label>
                    <input type="email" className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none" value={formData.Email} onChange={(e) => setFormData({...formData, Email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Số Điện Thoại</label>
                    <input type="text" className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none" value={formData.SDT} onChange={(e) => setFormData({...formData, SDT: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-text-muted mb-2">CCCD</label>
                    <input type="text" className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none" value={formData.CCCD} onChange={(e) => setFormData({...formData, CCCD: e.target.value})} />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-surface-hover flex gap-3 justify-end bg-surface mt-auto">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-lg font-medium border border-surface-hover text-text-muted hover:bg-surface-hover transition-colors">Hủy</button>
              <button type="submit" form="gvForm" className="px-4 py-2 rounded-lg font-medium bg-primary text-white hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">Lưu dữ liệu</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview Excel */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-surface-hover shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-surface-hover">
              <h2 className="text-xl font-bold text-text-primary">Xem trước dữ liệu Excel</h2>
              <button onClick={() => setIsPreviewModalOpen(false)} className="text-text-muted hover:text-semantic-error hover:bg-semantic-error/10 p-1 rounded transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-5 overflow-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-header text-text-muted uppercase text-xs tracking-wider border-b border-surface-hover">
                    <th className="p-3 font-semibold">Mã GV</th>
                    <th className="p-3 font-semibold">Họ Tên</th>
                    <th className="p-3 font-semibold">Mã Khoa</th>
                    <th className="p-3 font-semibold">Ngày Sinh</th>
                    <th className="p-3 font-semibold">Giới Tính</th>
                  </tr>
                </thead>
                <tbody className="text-text-primary text-sm divide-y divide-surface-hover">
                  {excelPreviewData.map((row, idx) => (
                    <tr key={idx} className={`transition-colors ${row.isDuplicate ? 'bg-semantic-error/10 text-semantic-error' : 'hover:bg-surface-hover/50'}`}>
                      <td className="p-3 font-medium">
                        {row.MaGV}
                        {row.isDuplicate && <span className="ml-2 text-xs bg-semantic-error text-white px-1.5 py-0.5 rounded">Trùng</span>}
                      </td>
                      <td className="p-3">{row.HoTen}</td>
                      <td className="p-3">{row.MaKhoa}</td>
                      <td className="p-3">{row.NgaySinh}</td>
                      <td className="p-3">{row.GioiTinh}</td>
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

            <div className="flex justify-between items-center p-5 border-t border-surface-hover bg-surface-header rounded-b-xl">
               <div className="flex flex-col">
                  <span className="text-sm text-text-muted">Tổng cộng: <strong className="text-text-primary">{excelPreviewData.length}</strong> dòng</span>
                  <span className="text-sm text-semantic-success">Hợp lệ (Sẵn sàng nhập): <strong>{excelPreviewData.filter(r => !r.isDuplicate).length}</strong></span>
               </div>
               <div className="flex gap-3">
                 <button onClick={() => setIsPreviewModalOpen(false)} className="px-4 py-2 rounded-lg font-medium text-text-muted hover:bg-surface-hover border border-transparent transition-colors">
                  Hủy
                 </button>
                 <button 
                  onClick={confirmImportExcel}
                  disabled={isImporting || excelPreviewData.filter(r => !r.isDuplicate).length === 0}
                  className="px-5 py-2 rounded-lg font-medium bg-semantic-success text-white hover:bg-semantic-success/90 transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2"
                 >
                  {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={18} />}
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

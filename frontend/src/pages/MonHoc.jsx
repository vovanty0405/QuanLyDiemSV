import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, Edit, X, Eye, Upload, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient';
import * as XLSX from 'xlsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-red-500 bg-red-100 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Lỗi giao diện (Crash)</h2>
          <p className="mb-2"><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
          <pre className="text-xs bg-black text-white p-4 rounded overflow-auto max-h-96">
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function CourseManagement() {
  return (
    <ErrorBoundary>
      <CourseManagementContent />
    </ErrorBoundary>
  );
}

function CourseManagementContent() {
  const [courses, setCourses] = useState([]);
  const [khoas, setKhoas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKhoa, setFilterKhoa] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('ADD'); 
  const [currentEditData, setCurrentEditData] = useState({
    MaMon: '', TenMon: '', SoTinChi: 3, SoTietLyThuyet: 30, SoTietThucHanh: 0, MaKhoa: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Prerequisite states
  const [prerequisites, setPrerequisites] = useState({});
  const [selectedPrereqToAdd, setSelectedPrereqToAdd] = useState('');

  // Excel states
  const fileInputRef = useRef(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [excelPreviewData, setExcelPreviewData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [monHocRes, khoaRes] = await Promise.all([
        axiosClient.get('/monhoc'),
        axiosClient.get('/khoa')
      ]);
      setCourses(monHocRes.data || []);
      setKhoas(khoaRes.data || []);

      // Extract prerequisites map
      const preReqMap = {};
      (monHocRes.data || []).forEach(course => {
        if (course.MonHocChinh && course.MonHocChinh.length > 0) {
           preReqMap[course.MaMon] = course.MonHocChinh.map(dk => ({
              MaMon: dk.MaMonTienQuyet,
              TenMon: dk.MonHocTienQuyet?.TenMon || ''
           }));
        }
      });
      setPrerequisites(preReqMap);
      
      // Update selectedCourse if it was selected to reflect new data
      if (selectedCourse) {
         const updated = (monHocRes.data || []).find(c => c.MaMon === selectedCourse.MaMon);
         setSelectedCourse(updated || null);
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- EXCEL HANDLERS ---
  const handleExportExcel = () => {
    const dataToExport = courses.map(c => {
      const prereqs = prerequisites[c.MaMon] ? prerequisites[c.MaMon].map(p => p.MaMon).join(', ') : '';
      return {
        'Mã Môn': c.MaMon,
        'Tên Môn': c.TenMon,
        'Số Tín Chỉ': c.SoTinChi,
        'Số Tiết LT': c.SoTietLyThuyet,
        'Số Tiết TH': c.SoTietThucHanh,
        'Khoa': c.Khoa?.TenKhoa || c.MaKhoa,
        'Môn Tiên Quyết': prereqs
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'MonHoc');
    XLSX.writeFile(workbook, 'DanhSachMonHoc.xlsx');
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
      
      const existingMaMons = new Set(courses.map(c => String(c.MaMon).trim().toLowerCase()));
      const seenInExcel = new Set();

      // Map to preview structure
      const formattedData = data.map(row => {
        const maMonStr = String(row['Mã Môn'] || '').trim();
        const lowerMaMon = maMonStr.toLowerCase();
        
        let isDuplicate = false;
        if (!maMonStr) {
          isDuplicate = true; // Invalid
        } else if (existingMaMons.has(lowerMaMon) || seenInExcel.has(lowerMaMon)) {
          isDuplicate = true;
        } else {
          seenInExcel.add(lowerMaMon);
        }

        return {
          MaMon: maMonStr,
          TenMon: row['Tên Môn'] || '',
          SoTinChi: parseInt(row['Số Tín Chỉ']) || 3,
          SoTietLyThuyet: parseInt(row['Số Tiết LT']) || 0,
          SoTietThucHanh: parseInt(row['Số Tiết TH']) || 0,
          MaKhoa: row['Khoa'] || null, 
          MonTienQuyet: row['Môn Tiên Quyết'] || '',
          isDuplicate
        };
      });

      setExcelPreviewData(formattedData);
      setIsPreviewModalOpen(true);
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // reset
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
        // Find MaKhoa if user input Khoa name
        let maKhoa = row.MaKhoa;
        if (maKhoa) {
           const found = khoas.find(k => k.TenKhoa === maKhoa || k.MaKhoa === maKhoa);
           if (found) maKhoa = found.MaKhoa;
        }

        const prereqs = row.MonTienQuyet 
          ? row.MonTienQuyet.split(',').map(s => s.trim()).filter(s => s) 
          : [];

        return {
          MaMon: String(row.MaMon),
          TenMon: String(row.TenMon),
          SoTinChi: row.SoTinChi,
          SoTietLyThuyet: row.SoTietLyThuyet,
          SoTietThucHanh: row.SoTietThucHanh,
          MaKhoa: maKhoa || null,
          MonTienQuyetIds: prereqs
        };
      });

      await axiosClient.post('/monhoc/bulk', payload);
      toast.success(`Đã nhập thành công ${payload.length} dòng dữ liệu!`);
      setIsPreviewModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi nhập Excel');
    } finally {
      setIsImporting(false);
    }
  };

  // --- MODAL HANDLERS ---
  const openAddModal = () => {
    setModalMode('ADD');
    setCurrentEditData({ MaMon: '', TenMon: '', SoTinChi: 3, SoTietLyThuyet: 30, SoTietThucHanh: 0, MaKhoa: khoas.length > 0 ? khoas[0].MaKhoa : '' });
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setModalMode('EDIT');
    setCurrentEditData({ ...course, MaKhoa: course.MaKhoa || '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!currentEditData.MaMon || !currentEditData.TenMon) {
      toast.error('Vui lòng nhập đầy đủ Mã môn và Tên môn');
      return;
    }

    try {
      setIsSaving(true);
      if (modalMode === 'ADD') {
        await axiosClient.post('/monhoc', currentEditData);
        toast.success('Thêm Môn học mới thành công!');
      } else {
        // Also send existing prerequisites so they don't get erased if updateMonHoc overwrites them
        // Actually, our service only updates prerequisites if `MonTienQuyetIds` is provided (not undefined)
        // So we can just omit it to preserve existing ones.
        const { MonHocChinh, ...dataToUpdate } = currentEditData;
        await axiosClient.put(`/monhoc/${currentEditData.MaMon}`, dataToUpdate);
        toast.success('Cập nhật Môn học thành công!');
      }
      closeModal();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSaving(false);
    }
  };

  // --- ACTION HANDLERS ---
  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa môn học này?')) {
      try {
        await axiosClient.delete(`/monhoc/${courseId}`);
        toast.success('Xóa môn học thành công!');
        fetchData();
        if (selectedCourse?.MaMon === courseId) {
          setSelectedCourse(null);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi xóa Môn học');
      }
    }
  };

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setSelectedPrereqToAdd('');
  };

  // --- PREREQUISITE HANDLERS ---
  const handleAddPrerequisite = async () => {
    if (!selectedCourse || !selectedPrereqToAdd) return;
    
    const currentPrereqs = prerequisites[selectedCourse.MaMon] || [];
    if (currentPrereqs.some(p => p.MaMon === selectedPrereqToAdd)) {
      toast.error('Môn học này đã có trong danh sách tiên quyết!');
      return;
    }

    const newPrereqsIds = [...currentPrereqs.map(p => p.MaMon), selectedPrereqToAdd];

    try {
      // Put to update prerequisites
      await axiosClient.put(`/monhoc/${selectedCourse.MaMon}`, {
        MonTienQuyetIds: newPrereqsIds
      });
      toast.success('Thêm môn tiên quyết thành công!');
      fetchData();
      setSelectedPrereqToAdd('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, có thể do vòng lặp tiên quyết.');
    }
  };

  const handleRemovePrerequisite = async (prereqId) => {
    if (!selectedCourse) return;
    const currentPrereqs = prerequisites[selectedCourse.MaMon] || [];
    const newPrereqsIds = currentPrereqs.filter(p => p.MaMon !== prereqId).map(p => p.MaMon);
    
    try {
      await axiosClient.put(`/monhoc/${selectedCourse.MaMon}`, {
        MonTienQuyetIds: newPrereqsIds
      });
      toast.success('Xóa môn tiên quyết thành công!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // --- RENDER HELPERS ---
  const filteredCourses = courses.filter(c => {
    const matchName = c.TenMon.toLowerCase().includes(searchTerm.toLowerCase()) || c.MaMon.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKhoa = filterKhoa === 'ALL' || c.MaKhoa === filterKhoa;
    return matchName && matchKhoa;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterKhoa]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Quản lý Môn Học</h1>
        
        <div className="flex flex-wrap gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls" 
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-surface-hover text-text-primary rounded-lg hover:border-[#4d8eff] hover:text-[#4d8eff] transition-colors font-medium"
          >
            <Upload size={18} />
            Nhập Excel
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-surface-hover text-text-primary rounded-lg hover:border-[#10B981] hover:text-[#10B981] transition-colors font-medium"
          >
            <Download size={18} />
            Xuất Excel
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#4d8eff] text-white rounded-lg hover:bg-[#4d8eff]/90 transition-colors font-medium shadow-lg shadow-[#4d8eff]/20"
          >
            <Plus size={18} />
            Thêm Môn học mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* CỘT TRÁI (8 cột) - Danh sách môn học */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {/* Thanh Filter */}
          <div className="flex flex-col md:flex-row gap-4 bg-surface p-4 rounded-lg border border-surface-hover">
            <select 
              value={filterKhoa}
              onChange={(e) => setFilterKhoa(e.target.value)}
              className="bg-canvas border border-surface-hover text-text-primary px-4 py-2 rounded-md outline-none focus:border-[#4d8eff] w-full md:w-auto"
            >
              <option value="ALL">Tất cả Khoa</option>
              {khoas.map(k => (
                <option key={k.MaKhoa} value={k.MaKhoa}>{k.TenKhoa}</option>
              ))}
            </select>
            
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Tìm mã môn, tên môn..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-canvas border border-surface-hover text-text-primary pl-10 pr-4 py-2 rounded-md outline-none focus:border-[#4d8eff]"
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-surface rounded-lg border border-surface-hover overflow-hidden min-h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center h-full p-12">
                <Loader2 className="animate-spin text-[#4d8eff]" size={40} />
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#191b23] text-text-muted uppercase text-xs tracking-wider border-b border-surface-hover">
                    <th className="p-4 font-medium">Mã Môn</th>
                    <th className="p-4 font-medium">Tên Môn</th>
                    <th className="p-4 font-medium text-center">Số TC</th>
                    <th className="p-4 font-medium text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="text-text-primary text-sm divide-y divide-[#32353c]">
                  {currentItems.map(course => {
                    const isSelected = selectedCourse?.MaMon === course.MaMon;
                    return (
                      <tr 
                        key={course.MaMon} 
                        className={`transition-colors ${isSelected ? 'bg-surface-hover/40' : 'hover:bg-surface-hover/30'}`}
                      >
                        <td className="p-4 font-medium cursor-pointer" onClick={() => handleViewCourse(course)}>{course.MaMon}</td>
                        <td className="p-4 cursor-pointer" onClick={() => handleViewCourse(course)}>{course.TenMon}</td>
                        <td className="p-4 text-center text-[#4d8eff] font-medium cursor-pointer" onClick={() => handleViewCourse(course)}>{course.SoTinChi}</td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => handleViewCourse(course)}
                              className={`p-1.5 rounded transition-colors ${isSelected ? 'text-[#4d8eff] bg-[#4d8eff]/10' : 'text-text-muted hover:text-[#4d8eff] hover:bg-[#4d8eff]/10'}`}
                              title="Xem chi tiết"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => openEditModal(course)}
                              className="p-1.5 rounded text-text-muted hover:text-[#10B981] hover:bg-[#10B981]/10 transition-colors"
                              title="Sửa"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteCourse(course.MaMon)}
                              className="p-1.5 rounded text-text-muted hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredCourses.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-text-muted">Không tìm thấy môn học nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 0 && (
              <div className="flex justify-between items-center px-4 py-3 border border-t-0 border-surface-hover bg-[#191b23] rounded-b-lg">
                  <span className="text-sm text-text-muted">
                      Hiển thị {indexOfFirstItem + 1} đến {Math.min(indexOfLastItem, filteredCourses.length)} trong tổng số {filteredCourses.length} môn
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

        {/* CỘT PHẢI (4 cột) - Chi tiết & Môn tiên quyết */}
        <div className="col-span-12 lg:col-span-4">
          <div className="sticky top-6">
            {!selectedCourse ? (
              <div className="border-2 border-dashed border-surface-hover rounded-lg p-10 flex flex-col items-center justify-center text-center text-text-muted bg-surface/50 h-full min-h-[300px]">
                <Eye size={48} className="mb-4 text-[#32353c]" />
                <p>Vui lòng chọn một môn học từ danh sách để xem chi tiết và quản lý tiên quyết</p>
              </div>
            ) : (
              <div className="bg-surface p-5 rounded-lg border border-surface-hover">
                {/* Phần 1: Thông tin (Read-only) */}
                <h3 className="text-lg font-semibold text-text-primary mb-4">Thông tin Môn học</h3>
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Mã môn:</span>
                    <span className="text-text-primary font-medium">{selectedCourse.MaMon}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Tên môn:</span>
                    <span className="text-text-primary font-medium text-right max-w-[200px] truncate" title={selectedCourse.TenMon}>{selectedCourse.TenMon}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Số tín chỉ:</span>
                    <span className="text-[#4d8eff] font-semibold">{selectedCourse.SoTinChi}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Khoa quản lý:</span>
                    <span className="text-text-primary">{selectedCourse.Khoa?.TenKhoa || selectedCourse.MaKhoa}</span>
                  </div>
                </div>

                <hr className="border-surface-hover mb-6" />

                {/* Phần 2: Môn Tiên Quyết */}
                <h3 className="text-md font-semibold text-text-primary mb-4">Quản lý môn tiên quyết</h3>
                
                {/* Khu vực Add */}
                <div className="flex gap-2 mb-4">
                  <select 
                    value={selectedPrereqToAdd}
                    onChange={(e) => setSelectedPrereqToAdd(e.target.value)}
                    className="flex-1 bg-canvas border border-surface-hover text-text-primary px-3 py-2 rounded-md outline-none focus:border-[#4d8eff] text-sm"
                  >
                    <option value="">-- Chọn môn --</option>
                    {courses
                      .filter(c => c.MaMon !== selectedCourse.MaMon && c.MaKhoa === selectedCourse.MaKhoa)
                      .map(c => (
                        <option key={c.MaMon} value={c.MaMon}>{c.MaMon} - {c.TenMon}</option>
                      ))}
                  </select>
                  <button 
                    onClick={handleAddPrerequisite}
                    disabled={!selectedPrereqToAdd}
                    className="px-4 bg-[#4d8eff] text-white rounded-md hover:bg-[#4d8eff]/90 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    Thêm
                  </button>
                </div>

                {/* Mini-table Prereqs */}
                <div className="max-h-[250px] overflow-y-auto border border-surface-hover rounded-md bg-canvas">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-[#191b23] sticky top-0">
                      <tr>
                        <th className="p-3 text-text-muted font-medium border-b border-surface-hover">Mã Môn TQ</th>
                        <th className="p-3 text-text-muted font-medium border-b border-surface-hover">Tên Môn TQ</th>
                        <th className="p-3 border-b border-surface-hover"></th>
                      </tr>
                    </thead>
                    <tbody className="text-text-primary divide-y divide-[#32353c]">
                      {(prerequisites[selectedCourse.MaMon] || []).length > 0 ? (
                        (prerequisites[selectedCourse.MaMon] || []).map(prereq => (
                          <tr key={prereq.MaMon} className="hover:bg-surface-hover/30">
                            <td className="p-3">{prereq.MaMon}</td>
                            <td className="p-3 truncate max-w-[120px]" title={prereq.TenMon}>{prereq.TenMon}</td>
                            <td className="p-3 text-right">
                              <button 
                                onClick={() => handleRemovePrerequisite(prereq.MaMon)}
                                className="text-[#ffb4ab] hover:text-[#EF4444] p-1 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="p-6 text-center text-text-muted">Chưa có môn tiên quyết</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL THÊM / SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl w-full max-w-lg border border-surface-hover shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-surface-hover">
              <h2 className="text-xl font-bold text-text-primary">
                {modalMode === 'ADD' ? 'Thêm môn học mới' : 'Cập nhật môn học'}
              </h2>
              <button 
                onClick={closeModal}
                className="text-text-muted hover:text-[#EF4444] hover:bg-[#EF4444]/10 p-1 rounded transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <form onSubmit={handleSaveModal}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Mã Môn</label>
                  <input 
                    type="text" 
                    value={currentEditData.MaMon}
                    onChange={(e) => setCurrentEditData({...currentEditData, MaMon: e.target.value})}
                    disabled={modalMode === 'EDIT'}
                    className="w-full bg-canvas border border-surface-hover text-text-primary px-3 py-2 rounded-md outline-none focus:border-[#4d8eff] disabled:opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Tên Môn</label>
                  <input 
                    type="text" 
                    value={currentEditData.TenMon}
                    onChange={(e) => setCurrentEditData({...currentEditData, TenMon: e.target.value})}
                    className="w-full bg-canvas border border-surface-hover text-text-primary px-3 py-2 rounded-md outline-none focus:border-[#4d8eff]"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-text-muted mb-1">Số Tín Chỉ</label>
                    <input 
                      type="number" 
                      value={currentEditData.SoTinChi}
                      onChange={(e) => setCurrentEditData({...currentEditData, SoTinChi: Number(e.target.value)})}
                      className="w-full bg-canvas border border-surface-hover text-text-primary px-3 py-2 rounded-md outline-none focus:border-[#4d8eff]"
                      required min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Số tiết LT</label>
                    <input 
                      type="number" 
                      value={currentEditData.SoTietLyThuyet}
                      onChange={(e) => setCurrentEditData({...currentEditData, SoTietLyThuyet: Number(e.target.value)})}
                      className="w-full bg-canvas border border-surface-hover text-text-primary px-3 py-2 rounded-md outline-none focus:border-[#4d8eff]"
                      required min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Số tiết TH</label>
                    <input 
                      type="number" 
                      value={currentEditData.SoTietThucHanh}
                      onChange={(e) => setCurrentEditData({...currentEditData, SoTietThucHanh: Number(e.target.value)})}
                      className="w-full bg-canvas border border-surface-hover text-text-primary px-3 py-2 rounded-md outline-none focus:border-[#4d8eff]"
                      required min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Khoa quản lý</label>
                  <select 
                    value={currentEditData.MaKhoa}
                    onChange={(e) => setCurrentEditData({...currentEditData, MaKhoa: e.target.value})}
                    className="w-full bg-canvas border border-surface-hover text-text-primary px-3 py-2 rounded-md outline-none focus:border-[#4d8eff]"
                  >
                    <option value="" disabled>-- Chọn khoa --</option>
                    {khoas.map(k => (
                      <option key={k.MaKhoa} value={k.MaKhoa}>{k.TenKhoa}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-5 border-t border-surface-hover bg-surface/50 rounded-b-xl">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="px-4 py-2 rounded-lg font-medium text-text-muted hover:bg-surface-hover transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg font-medium bg-[#4d8eff] text-white hover:bg-[#4d8eff]/90 transition-colors shadow-lg shadow-[#4d8eff]/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  Lưu Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW EXCEL */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-surface-hover shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-surface-hover">
              <h2 className="text-xl font-bold text-text-primary">Xem trước dữ liệu Excel</h2>
              <button 
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-text-muted hover:text-[#EF4444] hover:bg-[#EF4444]/10 p-1 rounded transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-5 overflow-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#191b23] text-text-muted uppercase text-xs tracking-wider border-b border-surface-hover">
                    <th className="p-3 font-medium">Mã Môn</th>
                    <th className="p-3 font-medium">Tên Môn</th>
                    <th className="p-3 font-medium text-center">Số TC</th>
                    <th className="p-3 font-medium text-center">LT/TH</th>
                    <th className="p-3 font-medium">Khoa</th>
                    <th className="p-3 font-medium">Môn Tiên Quyết</th>
                  </tr>
                </thead>
                <tbody className="text-text-primary text-sm divide-y divide-[#32353c]">
                  {excelPreviewData.map((row, idx) => (
                    <tr key={idx} className={`transition-colors ${row.isDuplicate ? 'bg-[#ffb4ab]/20 text-[#ffb4ab]' : 'hover:bg-surface-hover/30'}`}>
                      <td className="p-3 font-medium">
                        {row.MaMon}
                        {row.isDuplicate && <span className="ml-2 text-xs bg-[#EF4444] text-white px-1.5 py-0.5 rounded">Trùng</span>}
                      </td>
                      <td className="p-3">{row.TenMon}</td>
                      <td className="p-3 text-center">{row.SoTinChi}</td>
                      <td className="p-3 text-center">{row.SoTietLyThuyet}/{row.SoTietThucHanh}</td>
                      <td className="p-3">{row.MaKhoa}</td>
                      <td className="p-3 text-[#10B981]">{row.MonTienQuyet}</td>
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

            {/* Footer */}
            <div className="flex justify-between items-center p-5 border-t border-surface-hover bg-surface/50 rounded-b-xl">
               <div className="flex flex-col">
                  <span className="text-sm text-text-muted">Tổng cộng: <strong className="text-white">{excelPreviewData.length}</strong> dòng</span>
                  <span className="text-sm text-[#10B981]">Hợp lệ (Sẵn sàng nhập): <strong>{excelPreviewData.filter(r => !r.isDuplicate).length}</strong></span>
               </div>
               <div className="flex gap-3">
                 <button 
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-medium text-text-muted hover:bg-surface-hover transition-colors"
                 >
                  Hủy
                 </button>
                 <button 
                  onClick={confirmImportExcel}
                  disabled={isImporting || excelPreviewData.filter(r => !r.isDuplicate).length === 0}
                  className="px-5 py-2 rounded-lg font-medium bg-[#10B981] text-white hover:bg-[#10B981]/90 transition-colors shadow-lg shadow-[#10B981]/20 disabled:opacity-50 flex items-center gap-2"
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

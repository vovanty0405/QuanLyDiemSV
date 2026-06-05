import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Save, Upload, Download, Lock, Search, X, Loader2, Users, DoorOpen, CalendarDays, Settings, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

// ============================================
// Hàm tính toán dùng chung
// ============================================
const tinhTongKet = (diemGK, diemCK, configData) => {
  if (diemGK === null || diemGK === undefined || diemCK === null || diemCK === undefined) return null;
  const tsQT = configData?.trongSoQT ?? 50;
  const tsCK = configData?.trongSoCK ?? 50;
  return Math.round((diemGK * (tsQT / 100) + diemCK * (tsCK / 100)) * 100) / 100;
};

const tinhDiemGKTuChiTiet = (chiTiet, configData) => {
    if (!configData?.cotDiemQT?.length) return null;
    let diemGK = 0;
    let coDiem = false;
    for (const cot of configData.cotDiemQT) {
        const diem = chiTiet?.[cot.id];
        if (diem !== undefined && diem !== null && diem !== '') {
            diemGK += Number(diem) * (Number(cot.weight) / 100);
            coDiem = true;
        }
    }
    return coDiem ? Math.round(diemGK * 100) / 100 : null;
};

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

export default function DiemSoGiangVien() {
  const { user } = useAuth();
  const isKhaoThi = user?.RoleID === 4;
  const isGiangVien = user?.RoleID === 2;
  const [selectedClass, setSelectedClass] = useState(null);

  // ============ VIEW 1 STATE ============
  const [lhpList, setLhpList] = useState([]);
  const [hocKys, setHocKys] = useState([]);
  const [filterHK, setFilterHK] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingLHP, setLoadingLHP] = useState(true);

  // ============ VIEW 2 STATE ============
  const [diemData, setDiemData] = useState([]);
  const [editedDiem, setEditedDiem] = useState({});
  const [loadingDiem, setLoadingDiem] = useState(false);
  const [lhpInfo, setLhpInfo] = useState(null);
  const [sortBy, setSortBy] = useState('HoTen');

  // Config State
  const [configData, setConfigData] = useState({ trongSoQT: 50, trongSoCK: 50, cotDiemQT: [] });
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState({ trongSoQT: 50, trongSoCK: 50, cotDiemQT: [] });

  // Password modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  // Excel
  const fileInputRef = useRef(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [excelPreviewData, setExcelPreviewData] = useState([]);

  // Grade Locking State
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isUnlockRequestModalOpen, setIsUnlockRequestModalOpen] = useState(false);
  const [unlockReason, setUnlockReason] = useState('');
  const [locking, setLocking] = useState(false);

  // ============ FETCH DATA ============
  const fetchLHPList = async () => {
    try {
      setLoadingLHP(true);
      const url = isKhaoThi ? '/lophocphan' : '/lophocphan/giangvien/my';
      const [lhpRes, hkRes] = await Promise.all([
        axiosClient.get(url),
        axiosClient.get('/hocky')
      ]);
      setLhpList(lhpRes.data || []);
      setHocKys(hkRes.data || []);
    } catch { toast.error('Lỗi tải danh sách Lớp học phần'); }
    finally { setLoadingLHP(false); }
  };

  useEffect(() => {
    fetchLHPList();
  }, []);

  const fetchDiem = async (lhp) => {
    try {
      setLoadingDiem(true);
      const res = await axiosClient.get(`/diem/lophocphan/${lhp.MaLHP}`);
      const data = res.data;
      setLhpInfo(data.lopHocPhan);
      setDiemData(data.danhSachDiem || []);
      setEditedDiem({});

      // Load config
      let cfg = { trongSoQT: 50, trongSoCK: 50, cotDiemQT: [] };
      if (lhp.CauHinhDiem) {
        try { cfg = JSON.parse(lhp.CauHinhDiem); } catch (e) {}
      }
      setConfigData(cfg);
    } catch { toast.error('Lỗi tải bảng điểm'); setDiemData([]); }
    finally { setLoadingDiem(false); }
  };

  // ============ VIEW 1 FILTERS ============
  const filteredLHP = lhpList.filter(lhp => {
    const matchHK = !filterHK || lhp.MaHK === filterHK;
    const matchSearch = !searchTerm ||
      lhp.MaLHP?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lhp.TenLopHP?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lhp.MonHoc?.TenMon?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchHK && matchSearch;
  });

  const handleSelectClass = (lhp) => {
    setSelectedClass(lhp);
    fetchDiem(lhp);
  };

  // ============ CẤU HÌNH ĐIỂM ============
  const openConfigModal = () => {
    setTempConfig(JSON.parse(JSON.stringify(configData)));
    setIsConfigModalOpen(true);
  };

  const addColumn = () => {
    setTempConfig(prev => ({
      ...prev,
      cotDiemQT: [...prev.cotDiemQT, { id: 'col_' + Date.now(), name: 'Cột điểm mới', weight: 0 }]
    }));
  };

  const updateColumn = (index, field, value) => {
    setTempConfig(prev => {
      const newCols = [...prev.cotDiemQT];
      newCols[index][field] = value;
      return { ...prev, cotDiemQT: newCols };
    });
  };

  const removeColumn = (index) => {
    setTempConfig(prev => ({
      ...prev,
      cotDiemQT: prev.cotDiemQT.filter((_, i) => i !== index)
    }));
  };

  const saveConfig = async () => {
    const qt = Number(tempConfig.trongSoQT);
    const ck = Number(tempConfig.trongSoCK);
    if (qt + ck !== 100) return toast.error('Tổng trọng số Quá trình và Cuối kỳ phải là 100%');
    
    let totalCols = 0;
    tempConfig.cotDiemQT.forEach(c => totalCols += Number(c.weight));
    if (tempConfig.cotDiemQT.length > 0 && Math.abs(totalCols - 100) > 0.01) {
      return toast.error('Tổng trọng số các cột điểm thành phần phải là 100%');
    }

    try {
      await axiosClient.put(`/lophocphan/${selectedClass.MaLHP}/config-grades`, tempConfig);
      toast.success('Lưu cấu hình điểm thành công');
      setConfigData(tempConfig);
      setIsConfigModalOpen(false);
      // Cập nhật lại LHP list để giữ CauHinhDiem
      fetchLHPList();
      fetchDiem({ ...selectedClass, CauHinhDiem: JSON.stringify(tempConfig) });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi lưu cấu hình');
    }
  };

  // ============ VIEW 2 GRADE LOGIC ============
  const handleScoreChange = (maSV, field, value) => {
    const numValue = value === '' ? null : Number(value);
    if (numValue !== null && (numValue < 0 || numValue > 10)) return;

    setEditedDiem(prev => {
      const svEdits = prev[maSV] || {};
      
      if (['DiemCK', 'DiemThiLan1', 'DiemThiLan2'].includes(field)) {
          return {
              ...prev,
              [maSV]: { ...svEdits, [field]: numValue }
          };
      }

      const currentChiTiet = svEdits.ChiTietDiemQT || {};
      return {
        ...prev,
        [maSV]: {
          ...svEdits,
          ChiTietDiemQT: { ...currentChiTiet, [field]: numValue }
        }
      };
    });
  };

  const getChiTietDiem = (item) => {
    if (!item.ChiTietDiemQT) return {};
    try { return JSON.parse(item.ChiTietDiemQT); } catch { return {}; }
  };

  const getDisplayValue = (item, edited, colId) => {
    if (edited?.ChiTietDiemQT?.[colId] !== undefined) return edited.ChiTietDiemQT[colId] ?? '';
    const chiTiet = getChiTietDiem(item);
    return chiTiet[colId] ?? '';
  };

  const getRowTongKet = (item, edited) => {
    const dbChiTiet = getChiTietDiem(item);
    const editedChiTiet = edited?.ChiTietDiemQT || {};
    const finalChiTiet = { ...dbChiTiet, ...editedChiTiet };

    const gk = tinhDiemGKTuChiTiet(finalChiTiet, configData);
    const ck = item.DiemCK;
    const tl1 = item.DiemThiLan1;
    const tl2 = item.DiemThiLan2;

    const tkGoc = tinhTongKet(gk, ck, configData);
    let tkCuoi = tkGoc;

    if (tkGoc !== null) {
      if (tl1 !== null && tl1 !== undefined) {
        const tk1 = tinhTongKet(gk, tl1, configData);
        if (tk1 !== null) {
          tkCuoi = tkGoc < 5.0 ? Math.min(tk1, 6.0) : Math.max(tkGoc, tk1);
        }
      }
      if (tl2 !== null && tl2 !== undefined) {
        const tk2 = tinhTongKet(gk, tl2, configData);
        if (tk2 !== null) {
          const finalL2 = tkGoc < 5.0 ? Math.min(tk2, 6.0) : Math.max(tkGoc, tk2);
          tkCuoi = Math.max(tkCuoi, finalL2);
        }
      }
    }
    return tkCuoi;
  };

  const handleSaveClick = () => {
    if (Object.keys(editedDiem).length === 0) {
      toast('Chưa có thay đổi nào để lưu', { icon: 'ℹ️' });
      return;
    }
    setIsPasswordModalOpen(true);
  };

  const handleConfirmSave = async (e) => {
    e.preventDefault();
    if (!password) { toast.error('Vui lòng nhập mật khẩu'); return; }
    try {
      setSaving(true);
      const danhSachDiem = Object.keys(editedDiem).map(maSV => {
          const edits = editedDiem[maSV];
          if (isGiangVien) {
              return { MaSV: maSV, ChiTietDiemQT: edits.ChiTietDiemQT };
          } else {
              return { MaSV: maSV, DiemCK: edits.DiemCK, DiemThiLan1: edits.DiemThiLan1, DiemThiLan2: edits.DiemThiLan2 };
          }
      });
      await axiosClient.put(`/diem/lophocphan/${selectedClass.MaLHP}/hang-loat`, { danhSachDiem, password });
      toast.success('Đã lưu bảng điểm thành công!');
      setIsPasswordModalOpen(false);
      setPassword('');
      setEditedDiem({});
      fetchDiem(selectedClass);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Lỗi lưu điểm');
    } finally { setSaving(false); }
  };

  const handleLockGrades = async () => {
    try {
      setLocking(true);
      await axiosClient.put(`/diem/lophocphan/${selectedClass.MaLHP}/chot-diem`);
      toast.success('Đã chốt bảng điểm thành công!');
      setIsLockModalOpen(false);
      fetchLHPList();
      fetchDiem(selectedClass);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi chốt điểm');
    } finally { setLocking(false); }
  };

  const handleRequestUnlock = async (e) => {
    e.preventDefault();
    if (!unlockReason.trim()) return toast.error('Vui lòng nhập lý do');
    try {
      setLocking(true);
      await axiosClient.post(`/diem/lophocphan/${selectedClass.MaLHP}/yeu-cau-mo-khoa`, { lyDo: unlockReason });
      toast.success('Đã gửi yêu cầu mở khóa đến Admin thành công!');
      setIsUnlockRequestModalOpen(false);
      setUnlockReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi gửi yêu cầu');
    } finally { setLocking(false); }
  };

  // ============ EXCEL ============
  const handleExportExcel = () => {
    const rows = sortedDiemData.map((item, idx) => {
      const edited = editedDiem[item.SinhVien?.MaSV];
      const tk = getRowTongKet(item, edited);
      
      const rowData = {
        'STT': idx + 1,
        'Mã SV': item.SinhVien?.MaSV,
        'Họ Tên': item.SinhVien?.HoTen,
      };

      configData.cotDiemQT.forEach(cot => {
          rowData[cot.name] = getDisplayValue(item, edited, cot.id);
      });

      rowData['Tổng GK'] = tinhDiemGKTuChiTiet({ ...getChiTietDiem(item), ...(edited?.ChiTietDiemQT || {}) }, configData) ?? '';
      rowData['Điểm CK'] = item.DiemCK ?? '';
      rowData['Thi Lại L1'] = item.DiemThiLan1 ?? '';
      rowData['Thi Lại L2'] = item.DiemThiLan2 ?? '';
      rowData['Tổng Kết'] = tk;
      rowData['Điểm Chữ'] = diemChu(tk);

      return rowData;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BangDiem');
    XLSX.writeFile(wb, `BangDiem_${selectedClass.MaLHP}.xlsx`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      const existingSVs = new Set(diemData.map(d => String(d.SinhVien?.MaSV).trim().toLowerCase()));
      const formatted = data.map(row => {
        const maSV = String(row['Mã SV'] || '').trim();
        const isValid = existingSVs.has(maSV.toLowerCase());
        
        const chiTietParsed = {};
        configData.cotDiemQT.forEach(cot => {
            if (row[cot.name] !== undefined) {
                chiTietParsed[cot.id] = Number(row[cot.name]);
            }
        });

        return {
          MaSV: maSV,
          HoTen: row['Họ Tên'] || '',
          ChiTietDiemQT: chiTietParsed,
          isValid
        };
      });
      setExcelPreviewData(formatted);
      setIsPreviewModalOpen(true);
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const confirmImportExcel = () => {
    const validRows = excelPreviewData.filter(r => r.isValid);
    if (validRows.length === 0) { toast.error('Không có dữ liệu hợp lệ'); return; }
    const newEdits = { ...editedDiem };
    validRows.forEach(row => {
      newEdits[row.MaSV] = { ChiTietDiemQT: row.ChiTietDiemQT };
    });
    setEditedDiem(newEdits);
    setIsPreviewModalOpen(false);
    toast.success(`Đã nhập điểm từ Excel cho ${validRows.length} sinh viên vào RAM.`);
  };

  // Sort
  const sortedDiemData = [...diemData].sort((a, b) => {
    if (sortBy === 'MaSV') return (a.SinhVien?.MaSV || '').localeCompare(b.SinhVien?.MaSV || '');
    return (a.SinhVien?.HoTen || '').localeCompare(b.SinhVien?.HoTen || '');
  });

  // ============ RENDER ============
  if (!selectedClass) {
    // ========== VIEW 1: CARD DASHBOARD ==========
    return (
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="mb-8">
          <div className="text-text-muted text-sm mb-2 font-medium">Trang chủ &gt; Điểm số</div>
          <h2 className="text-3xl font-bold text-text-primary">Nhập Điểm {isKhaoThi ? 'Khảo Thí' : 'Giảng Viên'}</h2>
        </div>

        {/* Top Bar Filters */}
        <div className="bg-surface rounded-xl border border-surface-hover p-4 mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-text-muted mb-1.5">Học Kỳ</label>
            <select value={filterHK} onChange={e => setFilterHK(e.target.value)}
              className="w-full bg-canvas border border-surface-hover rounded-lg px-3 py-2 text-text-primary text-sm focus:border-primary outline-none">
              <option value="">Tất cả Học kỳ</option>
              {hocKys.map(hk => <option key={hk.MaHK} value={hk.MaHK}>{hk.TenHK}</option>)}
            </select>
          </div>
          <div className="flex-[2] min-w-[250px]">
            <label className="block text-xs font-medium text-text-muted mb-1.5">Tìm kiếm</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="Nhập mã LHP, tên lớp, tên môn..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-canvas border border-surface-hover rounded-lg pl-9 pr-4 py-2 text-text-primary text-sm focus:border-primary outline-none" />
            </div>
          </div>
        </div>

        {/* Card Grid */}
        {loadingLHP ? (
          <div className="flex items-center justify-center py-20 text-text-muted">
            <Loader2 className="animate-spin mr-3" /> Đang tải danh sách...
          </div>
        ) : filteredLHP.length === 0 ? (
          <div className="text-center py-20 text-text-muted">Không tìm thấy lớp học phần nào</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredLHP.map(lhp => {
              const siSo = lhp.SiSoToiDa || '?';
              return (
                <div key={lhp.MaLHP}
                  className="bg-surface border border-surface-hover rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group flex flex-col">
                  {/* Card Header */}
                  <div className="p-4 pb-2">
                    <div className="text-xs text-text-muted mb-1 font-medium">LHP: {lhp.MaLHP}</div>
                    <h3 className="text-[15px] font-bold text-primary group-hover:text-primary/90 leading-tight min-h-[40px]">
                      {lhp.MonHoc?.TenMon || lhp.TenLopHP}
                    </h3>
                  </div>

                  {/* Card Body */}
                  <div className="px-4 pb-3 space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 text-text-muted text-xs">
                      <CalendarDays size={13} />
                      <span>{lhp.HocKy?.TenHK || lhp.MaHK}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted text-xs">
                      <DoorOpen size={13} />
                      <span>Phòng: {lhp.PhongHoc || 'Chưa xếp'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted text-xs">
                      <Users size={13} />
                      <span>{siSo} Sinh viên</span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-4 py-3 border-t border-surface-hover flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${
                          lhp.TrangThaiNhapDiem === 'Đã chốt điểm' ? 'bg-[#EF4444]' : 
                          lhp.TrangThaiNhapDiem === 'Đang nhập liệu' ? 'bg-[#4d8eff]' : 'bg-[#c2c6d6]'
                      }`}></div>
                      <span className={`text-xs font-medium ${
                          lhp.TrangThaiNhapDiem === 'Đã chốt điểm' ? 'text-[#EF4444]' : 
                          lhp.TrangThaiNhapDiem === 'Đang nhập liệu' ? 'text-[#4d8eff]' : 'text-[#c2c6d6]'
                      }`}>
                        {lhp.TrangThaiNhapDiem || 'Vui lòng nhập điểm'}
                      </span>
                    </div>
                    <button onClick={() => handleSelectClass(lhp)}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm">
                      Nhập Điểm
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ========== VIEW 2: EXCEL-LIKE GRID ENTRY ==========
  const changedCount = Object.keys(editedDiem).length;

  return (
    <div className="max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <button onClick={() => { setSelectedClass(null); setDiemData([]); setEditedDiem({}); }}
            className="flex items-center gap-1 text-text-muted hover:text-primary transition-colors text-sm mb-3">
            <ChevronLeft size={18} /> Quay lại danh sách
          </button>
          <h2 className="text-2xl font-bold text-text-primary">
            Danh Sách Sinh Viên — Môn: <span className="text-primary">{lhpInfo?.MonHoc?.TenMon || selectedClass.TenLopHP}</span>
            <span className="text-text-muted font-normal text-base ml-2">(Mã LHP: {selectedClass.MaLHP})</span>
          </h2>
        </div>
        {isGiangVien && (
          <button onClick={openConfigModal} className="flex items-center gap-2 px-4 py-2 bg-surface border border-surface-hover rounded-lg text-text-primary hover:border-primary transition-colors">
              <Settings size={18} />
              Cấu hình Điểm
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-surface rounded-xl border border-surface-hover p-4 mb-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-text-muted text-sm">Sĩ số: <strong className="text-text-primary">{diemData.length}</strong> sinh viên</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-canvas border border-surface-hover rounded-lg px-3 py-1.5 text-text-primary text-sm focus:border-primary outline-none">
            <option value="HoTen">Sắp xếp: Tên</option>
            <option value="MaSV">Sắp xếp: Mã SV</option>
          </select>
          {changedCount > 0 && (
            <div className="text-[#FFC107] text-xs flex items-center gap-1.5 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-[#FFC107]"></div>
              {changedCount} SV đã thay đổi (chưa lưu)
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls" className="hidden" />
          <button onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-surface-hover text-text-muted hover:border-primary hover:text-primary transition-colors">
            <Upload size={14} /> Nhập Excel
          </button>
          <button onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-surface-hover text-text-muted hover:border-[#10B981] hover:text-[#10B981] transition-colors">
            <Download size={14} /> Xuất Excel
          </button>
          {isGiangVien && lhpInfo?.TrangThaiNhapDiem === 'Đã chốt điểm' ? (
              <button onClick={() => setIsUnlockRequestModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold bg-[#EF4444] text-white hover:bg-[#EF4444]/90 transition-colors shadow-sm">
                <Lock size={14} /> Xin mở khóa điểm
              </button>
          ) : (
            <>
              {isGiangVien && lhpInfo?.TrangThaiNhapDiem === 'Đang nhập liệu' && (
                <button onClick={() => setIsLockModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold bg-[#EF4444] text-white hover:bg-[#EF4444]/90 transition-colors shadow-sm">
                  <Lock size={14} /> Chốt Bảng Điểm
                </button>
              )}
              <button onClick={handleSaveClick} disabled={changedCount === 0 || lhpInfo?.TrangThaiNhapDiem === 'Đã chốt điểm'}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-colors shadow-sm ${
                  changedCount > 0
                    ? 'bg-[#10B981] text-white hover:bg-[#10B981]/90 shadow-[#10B981]/20'
                    : 'bg-surface-hover text-text-muted cursor-not-allowed shadow-none'
                }`}>
                <Save size={14} /> Lưu Bảng Điểm
              </button>
            </>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface rounded-xl border border-surface-hover overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#191b23] border-b border-surface-hover text-text-muted text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold w-12 text-center">STT</th>
                <th className="px-4 py-3 font-semibold w-28">Mã SV</th>
                <th className="px-4 py-3 font-semibold min-w-[160px]">Họ Tên</th>
                
                {/* Render các cột động */}
                {configData.cotDiemQT.map(cot => (
                    <th key={cot.id} className="px-3 py-3 font-semibold text-center w-24">
                        {cot.name}<br/><span className="text-[9px] font-normal opacity-60">({cot.weight}%)</span>
                    </th>
                ))}
                
                <th className="px-3 py-3 font-semibold text-center w-24 border-l border-surface-hover">Tổng GK<br/><span className="text-[9px] font-normal opacity-60">({configData.trongSoQT}%)</span></th>
                <th className="px-3 py-3 font-semibold text-center w-24 text-text-muted opacity-70">CK<br/><span className="text-[9px] font-normal">({configData.trongSoCK}%)</span></th>
                <th className="px-3 py-3 font-semibold text-center w-24 text-text-muted opacity-70">Thi Lại L1</th>
                <th className="px-3 py-3 font-semibold text-center w-24 text-text-muted opacity-70">Thi Lại L2</th>
                <th className="px-4 py-3 font-semibold text-center w-24 border-l border-surface-hover">Tổng Kết</th>
                <th className="px-4 py-3 font-semibold text-center w-20">Chữ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-hover">
              {loadingDiem ? (
                <tr><td colSpan={10 + configData.cotDiemQT.length} className="text-center py-12 text-text-muted"><Loader2 className="animate-spin inline mr-2" />Đang tải...</td></tr>
              ) : sortedDiemData.length === 0 ? (
                <tr><td colSpan={10 + configData.cotDiemQT.length} className="text-center py-12 text-text-muted">Chưa có sinh viên nào trong lớp</td></tr>
              ) : (
                sortedDiemData.map((item, idx) => {
                  const maSV = item.SinhVien?.MaSV;
                  const edited = editedDiem[maSV];
                  const isEdited = !!edited;
                  const tk = getRowTongKet(item, edited);
                  const ch = diemChu(tk);

                  const dbChiTiet = getChiTietDiem(item);
                  const finalChiTiet = { ...dbChiTiet, ...(edited?.ChiTietDiemQT || {}) };
                  const diemGK = tinhDiemGKTuChiTiet(finalChiTiet, configData);

                  const inputClasses = (colId) =>
                    `w-full h-full px-2 py-2 text-center bg-canvas border-0 outline-none text-sm text-text-primary
                     focus:ring-2 focus:ring-primary/60 focus:bg-canvas rounded transition-all
                     ${edited?.ChiTietDiemQT?.[colId] !== undefined ? 'text-primary font-bold bg-primary/5' : ''}
                     disabled:opacity-50 disabled:cursor-not-allowed`;
                     
                  const inputNormalClasses = (field) =>
                    `w-full h-full px-2 py-2 text-center bg-canvas border-0 outline-none text-sm text-text-primary
                     focus:ring-2 focus:ring-primary/60 focus:bg-canvas rounded transition-all
                     ${edited?.[field] !== undefined ? 'text-primary font-bold bg-primary/5' : ''}
                     disabled:opacity-50 disabled:cursor-not-allowed`;

                  return (
                    <tr key={item.MaKQ} className={`transition-colors ${isEdited ? 'bg-primary/[0.03]' : 'hover:bg-surface-hover/30'}`}>
                      <td className="px-4 py-1 text-text-muted text-xs text-center">{idx + 1}</td>
                      <td className="px-4 py-1 text-text-primary font-medium text-sm">{maSV}</td>
                      <td className="px-4 py-1 text-text-primary text-sm">{item.SinhVien?.HoTen}</td>
                      
                      {/* Cột động */}
                      {configData.cotDiemQT.map(cot => (
                        <td key={cot.id} className="px-1 py-1">
                          {isGiangVien ? (
                            <input type="number" step="0.5" min="0" max="10" tabIndex={0}
                                disabled={lhpInfo?.TrangThaiNhapDiem === 'Đã chốt điểm'}
                                className={inputClasses(cot.id)}
                                value={getDisplayValue(item, edited, cot.id)}
                                onChange={e => handleScoreChange(maSV, cot.id, e.target.value)} />
                          ) : (
                            <div className="text-center text-sm text-text-muted py-2">{getDisplayValue(item, edited, cot.id) || '-'}</div>
                          )}
                        </td>
                      ))}

                      {/* Các cột read-only của Giảng viên */}
                      <td className="px-4 py-1 text-center font-bold text-sm text-text-primary border-l border-surface-hover bg-surface-hover/20">{diemGK !== null ? diemGK.toFixed(1) : '-'}</td>
                      
                      <td className="px-1 py-1">
                        {isKhaoThi ? (
                          <input type="number" step="0.5" min="0" max="10" tabIndex={0}
                                className={inputNormalClasses('DiemCK')}
                                value={edited?.DiemCK !== undefined ? edited.DiemCK : (item.DiemCK ?? '')}
                                onChange={e => handleScoreChange(maSV, 'DiemCK', e.target.value)} />
                        ) : (
                          <div className="text-center text-sm text-text-muted py-2">{item.DiemCK ?? '-'}</div>
                        )}
                      </td>
                      
                      <td className="px-1 py-1">
                        {isKhaoThi ? (
                          <input type="number" step="0.5" min="0" max="10" tabIndex={0}
                                className={inputNormalClasses('DiemThiLan1')}
                                value={edited?.DiemThiLan1 !== undefined ? edited.DiemThiLan1 : (item.DiemThiLan1 ?? '')}
                                onChange={e => handleScoreChange(maSV, 'DiemThiLan1', e.target.value)} />
                        ) : (
                          <div className="text-center text-sm text-text-muted py-2">{item.DiemThiLan1 ?? '-'}</div>
                        )}
                      </td>
                      
                      <td className="px-1 py-1">
                        {isKhaoThi ? (
                          <input type="number" step="0.5" min="0" max="10" tabIndex={0}
                                className={inputNormalClasses('DiemThiLan2')}
                                value={edited?.DiemThiLan2 !== undefined ? edited.DiemThiLan2 : (item.DiemThiLan2 ?? '')}
                                onChange={e => handleScoreChange(maSV, 'DiemThiLan2', e.target.value)} />
                        ) : (
                          <div className="text-center text-sm text-text-muted py-2">{item.DiemThiLan2 ?? '-'}</div>
                        )}
                      </td>
                      
                      <td className="px-4 py-1 text-center font-bold text-sm text-primary border-l border-surface-hover">{tk !== null ? tk.toFixed(1) : '-'}</td>
                      <td className={`px-4 py-1 text-center text-sm ${diemChuColor(ch)}`}>{ch}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== CẤU HÌNH ĐIỂM MODAL ===== */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-hover rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-surface-hover">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2"><Settings size={20} className="text-primary"/> Cấu hình điểm Lớp {selectedClass.MaLHP}</h3>
              <button onClick={() => setIsConfigModalOpen(false)} className="text-text-muted hover:text-[#EF4444] transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
                <div className="mb-6 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">Trọng số Quá trình (%)</label>
                        <input type="number" min="0" max="100" value={tempConfig.trongSoQT} onChange={e => setTempConfig({...tempConfig, trongSoQT: e.target.value})}
                            className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">Trọng số Cuối kỳ (%)</label>
                        <input type="number" min="0" max="100" value={tempConfig.trongSoCK} onChange={e => setTempConfig({...tempConfig, trongSoCK: e.target.value})}
                            className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none" />
                    </div>
                </div>

                <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold text-text-primary text-sm">Cột điểm thành phần (Quá trình)</h4>
                    <button onClick={addColumn} className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded hover:bg-primary/20 transition-colors">
                        <Plus size={14}/> Thêm cột
                    </button>
                </div>

                <div className="space-y-3">
                    {tempConfig.cotDiemQT.length === 0 ? (
                        <div className="text-center py-6 text-sm text-text-muted border border-dashed border-surface-hover rounded-lg">Chưa có cột điểm nào. Hãy thêm cột điểm.</div>
                    ) : (
                        tempConfig.cotDiemQT.map((cot, index) => (
                            <div key={cot.id} className="flex gap-3 items-center">
                                <div className="flex-1">
                                    <input type="text" placeholder="Tên cột (VD: Chuyên cần)" value={cot.name} onChange={e => updateColumn(index, 'name', e.target.value)}
                                        className="w-full bg-canvas border border-surface-hover rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none" />
                                </div>
                                <div className="w-24">
                                    <div className="relative">
                                        <input type="number" placeholder="Trọng số" value={cot.weight} onChange={e => updateColumn(index, 'weight', e.target.value)}
                                            className="w-full bg-canvas border border-surface-hover rounded-lg pl-3 pr-8 py-2 text-sm text-text-primary focus:border-primary outline-none" />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">%</span>
                                    </div>
                                </div>
                                <button onClick={() => removeColumn(index)} className="p-2 text-text-muted hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors">
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="p-5 border-t border-surface-hover flex justify-end gap-3">
                <button onClick={() => setIsConfigModalOpen(false)} className="px-4 py-2 rounded-lg text-text-muted hover:bg-surface-hover transition-colors text-sm font-medium">Hủy</button>
                <button onClick={saveConfig} className="px-5 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-bold shadow-lg shadow-primary/20">Lưu Cấu Hình</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== PASSWORD MODAL ===== */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-hover rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-surface-hover">
              <h3 className="text-lg font-bold text-[#FFC107] flex items-center gap-2">🔒 Xác thực bảo mật</h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-text-muted hover:text-[#EF4444] transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleConfirmSave} className="p-6">
              <p className="text-text-primary text-sm mb-4">
                Bạn đang chuẩn bị ghi điểm vào CSDL cho <strong>{changedCount} sinh viên</strong>.
              </p>
              <div className="mb-5">
                <label className="block text-sm font-medium text-text-muted mb-2">Mật khẩu xác nhận</label>
                <input type="password" autoFocus required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2 text-text-primary focus:border-[#FFC107] outline-none" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full py-2 rounded-lg font-bold bg-[#10B981] text-white hover:bg-[#10B981]/90 transition-colors shadow-lg shadow-[#10B981]/20 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Xác nhận Lưu Điểm
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== EXCEL PREVIEW MODAL ===== */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-surface-hover shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-surface-hover">
              <h2 className="text-xl font-bold text-text-primary">Xem trước dữ liệu Excel</h2>
              <button onClick={() => setIsPreviewModalOpen(false)} className="text-text-muted hover:text-[#EF4444] p-1 rounded transition-colors"><X size={24} /></button>
            </div>
            <div className="p-5 overflow-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#191b23] text-text-muted uppercase text-xs tracking-wider border-b border-surface-hover">
                    <th className="p-3">Mã SV</th><th className="p-3">Họ Tên</th>
                    {configData.cotDiemQT.map(cot => <th key={cot.id} className="p-3 text-center">{cot.name}</th>)}
                    <th className="p-3 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-surface-hover">
                  {excelPreviewData.map((row, idx) => (
                    <tr key={idx} className={row.isValid ? 'hover:bg-surface-hover/50' : 'bg-[#EF4444]/10 text-[#EF4444]'}>
                      <td className="p-3 font-medium">{row.MaSV}</td>
                      <td className="p-3">{row.HoTen}</td>
                      {configData.cotDiemQT.map(cot => <td key={cot.id} className="p-3 text-center">{row.ChiTietDiemQT[cot.id] ?? '-'}</td>)}
                      <td className="p-3 text-center">
                        {row.isValid
                          ? <span className="text-[#10B981] text-xs font-medium">✓ Hợp lệ</span>
                          : <span className="text-[#EF4444] text-xs font-medium">✗ Không tìm thấy SV</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center p-5 border-t border-surface-hover">
              <div className="text-sm text-text-muted">
                Hợp lệ: <strong className="text-[#10B981]">{excelPreviewData.filter(r => r.isValid).length}</strong> / {excelPreviewData.length}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsPreviewModalOpen(false)} className="px-4 py-2 rounded-lg text-text-muted hover:bg-surface-hover transition-colors text-sm">Hủy</button>
                <button onClick={confirmImportExcel} disabled={excelPreviewData.filter(r => r.isValid).length === 0}
                  className="px-5 py-2 rounded-lg font-medium bg-[#10B981] text-white hover:bg-[#10B981]/90 transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2 text-sm">
                  <Upload size={16} /> Xác nhận Nhập
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== LOCK MODAL ===== */}
      {isLockModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-hover rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-surface-hover">
              <h3 className="text-lg font-bold text-[#EF4444] flex items-center gap-2">⚠️ Chốt Bảng Điểm</h3>
              <button onClick={() => setIsLockModalOpen(false)} className="text-text-muted hover:text-[#EF4444] transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6">
              <p className="text-text-primary text-sm mb-4">
                Bạn có chắc chắn muốn chốt bảng điểm lớp <strong>{selectedClass.TenLopHP || selectedClass.MaLHP}</strong> không? 
                Sau khi chốt, bạn sẽ <strong>không thể sửa đổi điểm</strong> được nữa.
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setIsLockModalOpen(false)} className="flex-1 py-2 rounded-lg bg-surface-hover text-text-muted font-semibold hover:bg-surface-hover/80 transition-colors">Hủy</button>
                <button onClick={handleLockGrades} disabled={locking}
                  className="flex-1 py-2 rounded-lg bg-[#EF4444] text-white font-semibold hover:bg-[#EF4444]/90 transition-colors flex items-center justify-center gap-2">
                  {locking ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />} Chốt Điểm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== UNLOCK REQUEST MODAL ===== */}
      {isUnlockRequestModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-hover rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-surface-hover">
              <h3 className="text-lg font-bold text-[#4d8eff] flex items-center gap-2">✉️ Xin mở khóa điểm</h3>
              <button onClick={() => setIsUnlockRequestModalOpen(false)} className="text-text-muted hover:text-[#EF4444] transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleRequestUnlock} className="p-6">
              <p className="text-text-muted text-sm mb-4">
                Bảng điểm lớp <strong>{selectedClass.TenLopHP || selectedClass.MaLHP}</strong> đã được chốt. Vui lòng nhập lý do để gửi yêu cầu đến Admin mở khóa lại bảng điểm.
              </p>
              <div className="mb-5">
                <label className="block text-sm font-medium text-text-primary mb-2">Lý do xin mở khóa</label>
                <textarea required autoFocus rows="3" value={unlockReason} onChange={e => setUnlockReason(e.target.value)}
                  placeholder="Nhập lý do chi tiết..."
                  className="w-full bg-canvas border border-surface-hover rounded-lg p-3 text-text-primary focus:border-[#4d8eff] outline-none resize-none"></textarea>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsUnlockRequestModalOpen(false)} className="flex-1 py-2 rounded-lg bg-surface-hover text-text-muted font-semibold hover:bg-surface-hover/80 transition-colors">Hủy</button>
                <button type="submit" disabled={locking || !unlockReason.trim()}
                  className="flex-1 py-2 rounded-lg bg-[#4d8eff] text-white font-semibold hover:bg-[#4d8eff]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {locking ? <Loader2 size={16} className="animate-spin" /> : 'Gửi Yêu Cầu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

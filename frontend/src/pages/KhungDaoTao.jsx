import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Search, Loader2, Edit, Save, BookOpen, Trash2, Plus, X, Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function KhungDaoTao() {
  const fileInputRef = React.useRef(null);
  
  const [nganhs, setNganhs] = useState([]);
  const [loadingNganh, setLoadingNganh] = useState(true);
  const [searchNganh, setSearchNganh] = useState('');
  const [selectedNganh, setSelectedNganh] = useState(null);

  // Chi tiết khung đào tạo
  const [khungData, setKhungData] = useState(null);
  const [loadingKhung, setLoadingKhung] = useState(false);

  // Edit Quy Dinh state
  const [isEditingQuyDinh, setIsEditingQuyDinh] = useState(false);
  const [quyDinhForm, setQuyDinhForm] = useState({
    TongTTC: 130, TCBatBuoc: 100, TCTuChon: 30, MinGPA: 2.0
  });

  // Modal Add Subject state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [allMonHocs, setAllMonHocs] = useState([]);
  const [searchMon, setSearchMon] = useState('');
  const [selectedMonIds, setSelectedMonIds] = useState(new Set());
  const [addForm, setAddForm] = useState({
    HocKyDuKien: 1, LoaiMon: 'Bắt buộc'
  });

  // Fetch Ngành
  useEffect(() => {
    const fetchNganh = async () => {
      try {
        setLoadingNganh(true);
        const res = await axiosClient.get('/nganh');
        setNganhs(res.data);
      } catch (error) {
        toast.error('Lỗi khi tải danh sách ngành');
      } finally {
        setLoadingNganh(false);
      }
    };
    fetchNganh();
    
    // Fetch all subjects for the modal
    const fetchMonHoc = async () => {
      try {
        const res = await axiosClient.get('/monhoc');
        setAllMonHocs(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMonHoc();
  }, []);

  // Fetch Khung Đào Tạo khi chọn Ngành
  const fetchKhungDaoTao = async (maNganh) => {
    try {
      setLoadingKhung(true);
      const res = await axiosClient.get(`/khungchuongtrinh/${maNganh}`);
      const data = res.data;
      setKhungData(data);
      
      const qd = data.Nganh.QuyDinhTotNghiep;
      if (qd) {
        setQuyDinhForm({
          TongTTC: qd.TongTTC,
          TCBatBuoc: qd.TCBatBuoc,
          TCTuChon: qd.TCTuChon,
          MinGPA: qd.MinGPA
        });
      } else {
        setQuyDinhForm({ TongTTC: 130, TCBatBuoc: 100, TCTuChon: 30, MinGPA: 2.0 });
      }
      setIsEditingQuyDinh(false);
    } catch (error) {
      toast.error('Lỗi khi tải khung đào tạo');
    } finally {
      setLoadingKhung(false);
    }
  };

  const handleSelectNganh = (nganh) => {
    setSelectedNganh(nganh);
    fetchKhungDaoTao(nganh.MaNganh);
  };

  const handleSaveQuyDinh = async () => {
    try {
      await axiosClient.put(`/khungchuongtrinh/${selectedNganh.MaNganh}/quydinh`, quyDinhForm);
      toast.success('Đã lưu quy định tốt nghiệp');
      setIsEditingQuyDinh(false);
      fetchKhungDaoTao(selectedNganh.MaNganh);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu quy định');
    }
  };

  const handleDeleteMonFromKhung = async (maMon) => {
    if (!window.confirm('Xóa môn học này khỏi khung chương trình?')) return;
    try {
      await axiosClient.delete(`/khungchuongtrinh/${selectedNganh.MaNganh}/monhoc/${maMon}`);
      toast.success('Đã xóa môn học khỏi khung');
      fetchKhungDaoTao(selectedNganh.MaNganh);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa môn');
    }
  };

  const handleAddSubjects = async () => {
    if (selectedMonIds.size === 0) {
      toast.error('Vui lòng chọn ít nhất 1 môn học');
      return;
    }
    const payload = {
      data: Array.from(selectedMonIds).map(maMon => ({
        MaMon: maMon,
        HocKyDuKien: addForm.HocKyDuKien,
        LoaiMon: addForm.LoaiMon
      }))
    };
    try {
      await axiosClient.post(`/khungchuongtrinh/${selectedNganh.MaNganh}/monhoc`, payload);
      toast.success(`Đã thêm ${selectedMonIds.size} môn vào khung`);
      setIsAddModalOpen(false);
      setSelectedMonIds(new Set());
      fetchKhungDaoTao(selectedNganh.MaNganh);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi thêm môn');
    }
  };

  const handleExportExcel = () => {
    if (!khungData || !khungData.ChiTietKhung) return;
    
    const excelData = khungData.ChiTietKhung.map(item => ({
      'Mã Môn': item.MaMon,
      'Tên Môn': item.MonHoc?.TenMon || '',
      'Số Tín Chỉ': item.MonHoc?.SoTinChi || 0,
      'Học Kỳ Dự Kiến': item.HocKyDuKien,
      'Loại Môn': item.LoaiMon
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "KhungChuongTrinh");
    XLSX.writeFile(wb, `KhungChuongTrinh_${selectedNganh.MaNganh}.xlsx`);
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          toast.error('File Excel trống');
          return;
        }

        const payload = data.map(row => ({
          MaMon: row['Mã Môn'] || row['MaMon'],
          HocKyDuKien: parseInt(row['Học Kỳ Dự Kiến'] || row['HocKyDuKien'] || 1),
          LoaiMon: row['Loại Môn'] || row['LoaiMon'] || 'Bắt buộc'
        })).filter(item => item.MaMon);

        if (payload.length === 0) {
          toast.error('Không tìm thấy dữ liệu hợp lệ (cần cột "Mã Môn")');
          return;
        }

        await axiosClient.post(`/khungchuongtrinh/${selectedNganh.MaNganh}/monhoc`, { data: payload });
        toast.success(`Đã thêm/cập nhật ${payload.length} môn học từ Excel`);
        fetchKhungDaoTao(selectedNganh.MaNganh);
      } catch (error) {
        toast.error('Lỗi khi đọc file Excel hoặc lưu dữ liệu');
      } finally {
        e.target.value = ''; // Reset input
      }
    };
    reader.readAsBinaryString(file);
  };

  // Lọc ngành
  const filteredNganhs = nganhs.filter(n => 
    n.TenNganh?.toLowerCase().includes(searchNganh.toLowerCase()) || 
    n.MaNganh?.toLowerCase().includes(searchNganh.toLowerCase())
  );

  // Gom nhóm môn học theo Học Kỳ Dự Kiến
  const groupedSubjects = {};
  if (khungData && khungData.ChiTietKhung) {
    khungData.ChiTietKhung.forEach(item => {
      const hk = item.HocKyDuKien;
      if (!groupedSubjects[hk]) groupedSubjects[hk] = [];
      groupedSubjects[hk].push(item);
    });
  }

  // Lọc môn học trong Modal Add
  const filteredAllMonHocs = allMonHocs.filter(m => 
    m.TenMon?.toLowerCase().includes(searchMon.toLowerCase()) || 
    m.MaMon?.toLowerCase().includes(searchMon.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto w-full flex gap-6 h-[calc(100vh-100px)]">
      
      {/* LEFT COLUMN: 3/12 - Nganh List */}
      <div className="w-1/4 flex flex-col bg-surface border border-surface-hover rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-surface-hover bg-[#191b23]">
          <h2 className="text-lg font-bold text-text-primary mb-3">Ngành Đào Tạo</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Tìm kiếm ngành học..."
              value={searchNganh}
              onChange={e => setSearchNganh(e.target.value)}
              className="w-full bg-canvas border border-surface-hover rounded-lg pl-9 pr-4 py-2 text-text-primary text-sm focus:border-primary outline-none transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loadingNganh ? (
            <div className="flex justify-center p-8 text-primary"><Loader2 className="animate-spin" /></div>
          ) : filteredNganhs.map(nganh => {
            const isSelected = selectedNganh?.MaNganh === nganh.MaNganh;
            return (
              <div 
                key={nganh.MaNganh}
                onClick={() => handleSelectNganh(nganh)}
                className={`p-3 mb-1 rounded-lg cursor-pointer transition-colors ${
                  isSelected ? 'bg-surface-hover border-l-4 border-primary' : 'hover:bg-surface-hover/50 border-l-4 border-transparent'
                }`}
              >
                <div className="font-medium text-text-primary text-sm">{nganh.TenNganh}</div>
                <div className="text-xs text-text-muted mt-1">Mã: {nganh.MaNganh}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: 9/12 - Khung Details */}
      <div className="w-3/4 flex flex-col overflow-y-auto pr-2">
        {!selectedNganh ? (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted bg-surface border border-surface-hover rounded-xl">
            <BookOpen size={48} className="mb-4 opacity-50" />
            <p className="text-lg">Vui lòng chọn một ngành để thiết lập khung chương trình</p>
          </div>
        ) : loadingKhung ? (
          <div className="flex-1 flex items-center justify-center text-primary bg-surface border border-surface-hover rounded-xl"><Loader2 size={40} className="animate-spin" /></div>
        ) : (
          <div className="space-y-6">
            
            {/* SECTION A: QUY ĐỊNH TỐT NGHIỆP */}
            <div className="bg-surface border border-surface-hover rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-text-primary">Quy định chuẩn đầu ra - {selectedNganh.TenNganh}</h3>
                {isEditingQuyDinh ? (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditingQuyDinh(false)} className="px-3 py-1.5 text-sm rounded border border-surface-hover text-text-muted hover:bg-surface-hover transition-colors">Hủy</button>
                    <button onClick={handleSaveQuyDinh} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-primary text-white hover:bg-primary-hover transition-colors"><Save size={16} /> Lưu</button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditingQuyDinh(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-surface-hover text-text-muted hover:text-primary hover:border-primary transition-colors"><Edit size={16} /> Chỉnh sửa quy định</button>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-canvas p-4 rounded-lg border border-surface-hover">
                  <p className="text-text-muted text-sm mb-1">Tổng tín chỉ tối thiểu</p>
                  {isEditingQuyDinh ? (
                    <input type="number" value={quyDinhForm.TongTTC} onChange={e=>setQuyDinhForm({...quyDinhForm, TongTTC: e.target.value})} className="w-full bg-surface border border-surface-hover rounded px-2 py-1 text-primary font-bold outline-none" />
                  ) : (
                    <p className="text-2xl font-bold text-primary">{quyDinhForm.TongTTC} TC</p>
                  )}
                </div>
                <div className="bg-canvas p-4 rounded-lg border border-surface-hover">
                  <p className="text-text-muted text-sm mb-1">Tín chỉ bắt buộc</p>
                  {isEditingQuyDinh ? (
                    <input type="number" value={quyDinhForm.TCBatBuoc} onChange={e=>setQuyDinhForm({...quyDinhForm, TCBatBuoc: e.target.value})} className="w-full bg-surface border border-surface-hover rounded px-2 py-1 text-text-primary font-bold outline-none" />
                  ) : (
                    <p className="text-2xl font-bold text-text-primary">{quyDinhForm.TCBatBuoc} TC</p>
                  )}
                </div>
                <div className="bg-canvas p-4 rounded-lg border border-surface-hover">
                  <p className="text-text-muted text-sm mb-1">Tín chỉ tự chọn</p>
                  {isEditingQuyDinh ? (
                    <input type="number" value={quyDinhForm.TCTuChon} onChange={e=>setQuyDinhForm({...quyDinhForm, TCTuChon: e.target.value})} className="w-full bg-surface border border-surface-hover rounded px-2 py-1 text-text-primary font-bold outline-none" />
                  ) : (
                    <p className="text-2xl font-bold text-text-primary">{quyDinhForm.TCTuChon} TC</p>
                  )}
                </div>
                <div className="bg-canvas p-4 rounded-lg border border-[#df7412]/30">
                  <p className="text-text-muted text-sm mb-1">GPA Tối thiểu</p>
                  {isEditingQuyDinh ? (
                    <input type="number" step="0.1" value={quyDinhForm.MinGPA} onChange={e=>setQuyDinhForm({...quyDinhForm, MinGPA: e.target.value})} className="w-full bg-surface border border-[#df7412] rounded px-2 py-1 text-[#df7412] font-bold outline-none" />
                  ) : (
                    <p className="text-2xl font-bold text-[#df7412]">{quyDinhForm.MinGPA} / 4.0</p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION B: DANH SÁCH MÔN HỌC */}
            <div className="bg-surface border border-surface-hover rounded-xl p-5 shadow-sm min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-text-primary">Chi tiết các môn học</h3>
                <div className="flex gap-3">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImportExcel} 
                    accept=".xlsx, .xls" 
                    className="hidden" 
                  />
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-surface border border-surface-hover text-text-muted hover:text-text-primary transition-colors">
                    <Upload size={16} /> Nhập Excel
                  </button>
                  <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-surface border border-surface-hover text-text-muted hover:text-text-primary transition-colors">
                    <Download size={16} /> Xuất Excel
                  </button>
                  <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 transition-colors">
                    <Plus size={16} /> Thêm Môn Vào Khung
                  </button>
                </div>
              </div>

              {Object.keys(groupedSubjects).length === 0 ? (
                <div className="text-center py-12 text-text-muted">Chưa có môn học nào trong khung chương trình</div>
              ) : (
                <div className="space-y-6">
                  {Object.keys(groupedSubjects).sort((a,b) => parseInt(a) - parseInt(b)).map(hk => (
                    <div key={hk} className="border border-surface-hover rounded-lg overflow-hidden">
                      <div className="bg-[#191b23] px-4 py-3 font-semibold text-[#4d8eff] border-b border-surface-hover">
                        Học kỳ dự kiến {hk}
                      </div>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-canvas text-text-muted text-xs uppercase tracking-wider border-b border-surface-hover">
                            <th className="px-4 py-3 font-medium">Mã Môn</th>
                            <th className="px-4 py-3 font-medium">Tên Môn Học</th>
                            <th className="px-4 py-3 font-medium text-center">STC</th>
                            <th className="px-4 py-3 font-medium text-center">Loại Môn</th>
                            <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#32353c]">
                          {groupedSubjects[hk].map(item => (
                            <tr key={item.MaMon} className="hover:bg-surface-hover/30">
                              <td className="px-4 py-3 text-text-primary font-medium text-sm">{item.MaMon}</td>
                              <td className="px-4 py-3 text-text-primary text-sm">{item.MonHoc?.TenMon}</td>
                              <td className="px-4 py-3 text-text-muted text-center text-sm">{item.MonHoc?.SoTinChi}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  item.LoaiMon === 'Bắt buộc' ? 'bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/20' 
                                  : 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                                }`}>
                                  {item.LoaiMon}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button onClick={() => handleDeleteMonFromKhung(item.MaMon)} className="p-1.5 text-text-muted hover:text-semantic-error hover:bg-semantic-error/10 rounded-md transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL THÊM MÔN HỌC */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-3xl shadow-2xl border border-surface-hover overflow-hidden flex flex-col h-[80vh]">
            <div className="flex justify-between items-center p-5 border-b border-surface-hover bg-[#191b23]">
              <h2 className="text-xl font-bold text-text-primary">Thêm Môn Vào Khung Chương Trình</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-text-muted hover:text-semantic-error transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-5 border-b border-surface-hover flex flex-wrap gap-4 bg-canvas/50">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-text-muted mb-1">Học kỳ dự kiến</label>
                <select value={addForm.HocKyDuKien} onChange={e => setAddForm({...addForm, HocKyDuKien: parseInt(e.target.value)})} className="w-full bg-canvas border border-surface-hover rounded-lg px-3 py-2 text-text-primary outline-none focus:border-primary">
                  {[1,2,3,4,5,6,7,8,9,10].map(k => <option key={k} value={k}>Học kỳ {k}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-text-muted mb-1">Loại môn</label>
                <div className="flex gap-4 items-center h-[42px]">
                  <label className="flex items-center gap-2 cursor-pointer text-text-primary">
                    <input type="radio" name="loaiMon" checked={addForm.LoaiMon === 'Bắt buộc'} onChange={() => setAddForm({...addForm, LoaiMon: 'Bắt buộc'})} className="accent-primary" /> Bắt buộc
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-text-primary">
                    <input type="radio" name="loaiMon" checked={addForm.LoaiMon === 'Tự chọn'} onChange={() => setAddForm({...addForm, LoaiMon: 'Tự chọn'})} className="accent-primary" /> Tự chọn
                  </label>
                </div>
              </div>
            </div>

            <div className="flex-1 p-5 flex flex-col overflow-hidden">
              <div className="relative mb-4">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm môn học theo mã hoặc tên..."
                  value={searchMon}
                  onChange={e => setSearchMon(e.target.value)}
                  className="w-full bg-canvas border border-surface-hover rounded-lg pl-10 pr-4 py-2.5 text-text-primary text-sm focus:border-primary outline-none transition-colors"
                />
              </div>
              <div className="flex-1 overflow-y-auto border border-surface-hover rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[#191b23] z-10 border-b border-surface-hover">
                    <tr className="text-text-muted text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 font-semibold w-[50px] text-center">
                        <input type="checkbox" className="accent-primary" 
                          checked={filteredAllMonHocs.length > 0 && selectedMonIds.size === filteredAllMonHocs.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const newSet = new Set(selectedMonIds);
                              filteredAllMonHocs.forEach(m => newSet.add(m.MaMon));
                              setSelectedMonIds(newSet);
                            } else {
                              const newSet = new Set(selectedMonIds);
                              filteredAllMonHocs.forEach(m => newSet.delete(m.MaMon));
                              setSelectedMonIds(newSet);
                            }
                          }}
                        />
                      </th>
                      <th className="px-4 py-3 font-semibold">Mã MH</th>
                      <th className="px-4 py-3 font-semibold">Tên Môn Học</th>
                      <th className="px-4 py-3 font-semibold text-center">Số TC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#32353c]">
                    {filteredAllMonHocs.map(mon => (
                      <tr key={mon.MaMon} className="hover:bg-surface-hover/30 cursor-pointer" onClick={() => {
                        const newSet = new Set(selectedMonIds);
                        if (newSet.has(mon.MaMon)) newSet.delete(mon.MaMon);
                        else newSet.add(mon.MaMon);
                        setSelectedMonIds(newSet);
                      }}>
                        <td className="px-4 py-3 text-center">
                           <input type="checkbox" className="accent-primary cursor-pointer" checked={selectedMonIds.has(mon.MaMon)} readOnly />
                        </td>
                        <td className="px-4 py-3 text-text-primary font-medium text-sm">{mon.MaMon}</td>
                        <td className="px-4 py-3 text-text-primary text-sm">{mon.TenMon}</td>
                        <td className="px-4 py-3 text-text-muted text-center text-sm">{mon.SoTinChi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-surface-hover bg-canvas flex justify-between items-center">
              <div className="text-sm text-text-muted">Đã chọn <span className="font-bold text-primary">{selectedMonIds.size}</span> môn học</div>
              <div className="flex gap-3">
                <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-lg font-medium border border-surface-hover text-text-muted hover:bg-surface-hover transition-colors">Hủy</button>
                <button onClick={handleAddSubjects} className="px-4 py-2 rounded-lg font-medium bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 transition-colors">Lưu vào khung</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

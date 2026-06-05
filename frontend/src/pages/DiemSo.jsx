import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Save, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function DiemSo() {
  const { user } = useAuth();
  const [lhpList, setLhpList] = useState([]);
  const [selectedLhp, setSelectedLhp] = useState('');
  
  const [diemData, setDiemData] = useState([]); // Điểm gốc
  const [editedDiem, setEditedDiem] = useState({}); // Điểm đã sửa trên RAM
  const [loading, setLoading] = useState(false);
  
  // Modal xác nhận mật khẩu
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');

  // Lấy danh sách LHP để chọn
  useEffect(() => {
    const fetchLHP = async () => {
      try {
        const res = await axiosClient.get('/lophocphan');
        // Nếu là giảng viên, có thể cần lọc các lớp học phần do GV này phụ trách, nhưng hiện tại lấy tất cả.
        setLhpList(res.data);
      } catch (error) {
        toast.error('Lỗi tải danh sách Lớp học phần');
      }
    };
    fetchLHP();
  }, []);

  // Lấy bảng điểm khi chọn LHP
  useEffect(() => {
    const fetchBangDiem = async () => {
      if (!selectedLhp) return;
      try {
        setLoading(true);
        const res = await axiosClient.get(`/diem/lophocphan/${selectedLhp}`);
        setDiemData(res.data.danhSachDiem || []);
        setEditedDiem({}); // Xóa các điểm đã sửa khi chuyển lớp
      } catch (error) {
        toast.error('Lỗi tải bảng điểm của lớp này');
        setDiemData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBangDiem();
  }, [selectedLhp]);

  // Xử lý thay đổi điểm trên RAM
  const handleScoreChange = (maSV, field, value) => {
    const numValue = value === '' ? null : Number(value);
    
    if (numValue !== null && (numValue < 0 || numValue > 10)) {
      toast.error('Điểm phải từ 0 đến 10');
      return;
    }

    setEditedDiem(prev => ({
      ...prev,
      [maSV]: {
        ...prev[maSV],
        [field]: numValue
      }
    }));
  };

  // Tính điểm tổng kết tạm thời trên UI (Giả sử: CC 10%, GK 30%, CK 60%)
  const calculateTongKet = (sv, edited) => {
    const cc = edited?.DiemCC !== undefined ? edited.DiemCC : sv.DiemCC;
    const gk = edited?.DiemGK !== undefined ? edited.DiemGK : sv.DiemGK;
    const ck = edited?.DiemCK !== undefined ? edited.DiemCK : sv.DiemCK;
    
    if (cc === null || gk === null || ck === null) return null;
    return (cc * 0.1 + gk * 0.3 + ck * 0.6).toFixed(1);
  };

  // Mở modal nhập mật khẩu
  const handleSaveClick = () => {
    if (Object.keys(editedDiem).length === 0) {
      toast('Chưa có thay đổi nào để lưu', { icon: 'ℹ️' });
      return;
    }
    setIsPasswordModalOpen(true);
  };

  // Submit lưu bảng điểm
  const handleConfirmSave = async (e) => {
    e.preventDefault();
    if (!password) {
      toast.error('Vui lòng nhập mật khẩu xác nhận');
      return;
    }

    try {
      // Chuẩn bị payload: mảng các sinh viên có thay đổi điểm
      const danhSachDiem = Object.keys(editedDiem).map(maSV => {
        const edits = editedDiem[maSV];
        return {
          MaSV: maSV,
          ...edits
        };
      });

      await axiosClient.put(`/diem/lophocphan/${selectedLhp}/hang-loat`, {
        danhSachDiem,
        password
      });

      toast.success('Đã lưu bảng điểm thành công!');
      setIsPasswordModalOpen(false);
      setPassword('');
      setEditedDiem({});
      
      // Reload lại dữ liệu mới nhất
      const res = await axiosClient.get(`/diem/lophocphan/${selectedLhp}`);
      setDiemData(res.data);
      
    } catch (error) {
      toast.error(error.message || 'Mật khẩu sai hoặc có lỗi xảy ra!');
    }
  };

  const isReadOnly = user?.role !== 'Admin' && user?.role !== 'GiangVien';

  return (
    <div className="max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-text-muted text-sm mb-2 font-medium">Trang chủ &gt; Điểm số</div>
          <h2 className="text-3xl font-bold text-text-primary">Quản lý Bảng Điểm</h2>
        </div>
        
        {!isReadOnly && (
          <button 
            onClick={handleSaveClick}
            disabled={Object.keys(editedDiem).length === 0}
            className={`flex items-center gap-2 px-6 py-2 rounded font-medium transition-colors shadow-lg ${
              Object.keys(editedDiem).length > 0 
                ? 'bg-semantic-success text-white hover:bg-semantic-success/90 shadow-semantic-success/20' 
                : 'bg-surface-hover text-text-muted cursor-not-allowed shadow-none'
            }`}
          >
            <Save size={18} />
            <span>Lưu bảng điểm</span>
          </button>
        )}
      </div>

      <div className="bg-surface rounded-2xl border border-surface-hover overflow-hidden shadow-sm flex flex-col min-h-[600px]">
        <div className="p-5 border-b border-surface-hover bg-surface-header flex justify-between items-center">
           <div className="flex items-center gap-4 w-1/3">
             <label className="font-semibold text-text-primary whitespace-nowrap">Chọn Lớp học phần:</label>
             <select 
               className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none"
               value={selectedLhp}
               onChange={(e) => setSelectedLhp(e.target.value)}
             >
               <option value="" disabled>-- Chọn Lớp --</option>
               {lhpList.map(lhp => (
                 <option key={lhp.MaLHP} value={lhp.MaLHP}>{lhp.MaLHP} - {lhp.TenLopHP}</option>
               ))}
             </select>
           </div>
           
           {Object.keys(editedDiem).length > 0 && (
             <div className="text-semantic-warning text-sm flex items-center gap-2 animate-pulse">
               <div className="w-2 h-2 rounded-full bg-semantic-warning"></div>
               Đang có thay đổi chưa lưu trên RAM ({Object.keys(editedDiem).length} SV)
             </div>
           )}
        </div>
        
        <div className="overflow-x-auto flex-1">
          {!selectedLhp ? (
            <div className="flex flex-col items-center justify-center h-full pt-20 text-text-muted">
              <Search size={48} className="mb-4 opacity-20" />
              <p>Vui lòng chọn một lớp học phần để xem danh sách điểm.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-surface-hover text-text-muted text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold w-16">STT</th>
                  <th className="px-6 py-4 font-semibold">Mã SV</th>
                  <th className="px-6 py-4 font-semibold">Họ Tên</th>
                  <th className="px-6 py-4 font-semibold text-center w-28">Chuyên Cần<br/><span className="text-[10px] text-text-muted/60 font-normal">(10%)</span></th>
                  <th className="px-6 py-4 font-semibold text-center w-28">Giữa Kỳ<br/><span className="text-[10px] text-text-muted/60 font-normal">(30%)</span></th>
                  <th className="px-6 py-4 font-semibold text-center w-28">Cuối Kỳ<br/><span className="text-[10px] text-text-muted/60 font-normal">(60%)</span></th>
                  <th className="px-6 py-4 font-semibold text-center w-24">Tổng Kết</th>
                  <th className="px-6 py-4 font-semibold text-center w-24">Điểm Chữ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-hover">
                {loading ? (
                  <tr><td colSpan="8" className="text-center py-8 text-text-muted">Đang tải dữ liệu...</td></tr>
                ) : diemData.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-8 text-text-muted">Danh sách rỗng</td></tr>
                ) : (
                  diemData.map((item, index) => {
                    const edited = editedDiem[item.SinhVien.MaSV];
                    const isEditedRow = !!edited;
                    
                    return (
                      <tr key={item.MaKQ} className={`transition-colors ${isEditedRow ? 'bg-primary/5' : 'hover:bg-surface-hover/30'}`}>
                        <td className="px-6 py-4 text-text-muted text-sm text-center">{index + 1}</td>
                        <td className="px-6 py-4 text-text-primary font-medium">{item.SinhVien.MaSV}</td>
                        <td className="px-6 py-4 text-text-primary">{item.SinhVien.HoTen}</td>
                        
                        <td className="px-6 py-2 text-center">
                          <input 
                            type="number" step="0.5" min="0" max="10"
                            disabled={isReadOnly}
                            className={`w-16 px-2 py-1 text-center bg-canvas border rounded outline-none transition-colors ${edited?.DiemCC !== undefined ? 'border-primary text-primary font-bold' : 'border-surface-hover text-text-primary focus:border-primary'}`}
                            value={edited?.DiemCC !== undefined ? (edited.DiemCC ?? '') : (item.DiemCC ?? '')}
                            onChange={(e) => handleScoreChange(item.SinhVien.MaSV, 'DiemCC', e.target.value)}
                          />
                        </td>
                        <td className="px-6 py-2 text-center">
                          <input 
                            type="number" step="0.5" min="0" max="10"
                            disabled={isReadOnly}
                            className={`w-16 px-2 py-1 text-center bg-canvas border rounded outline-none transition-colors ${edited?.DiemGK !== undefined ? 'border-primary text-primary font-bold' : 'border-surface-hover text-text-primary focus:border-primary'}`}
                            value={edited?.DiemGK !== undefined ? (edited.DiemGK ?? '') : (item.DiemGK ?? '')}
                            onChange={(e) => handleScoreChange(item.SinhVien.MaSV, 'DiemGK', e.target.value)}
                          />
                        </td>
                        <td className="px-6 py-2 text-center">
                          <input 
                            type="number" step="0.5" min="0" max="10"
                            disabled={isReadOnly}
                            className={`w-16 px-2 py-1 text-center bg-canvas border rounded outline-none transition-colors ${edited?.DiemCK !== undefined ? 'border-primary text-primary font-bold' : 'border-surface-hover text-text-primary focus:border-primary'}`}
                            value={edited?.DiemCK !== undefined ? (edited.DiemCK ?? '') : (item.DiemCK ?? '')}
                            onChange={(e) => handleScoreChange(item.SinhVien.MaSV, 'DiemCK', e.target.value)}
                          />
                        </td>
                        
                        <td className="px-6 py-4 text-center font-semibold text-text-primary">
                          {calculateTongKet(item, edited) ?? '-'}
                        </td>
                        <td className="px-6 py-4 text-center text-text-muted">
                          {isEditedRow ? <span className="text-xs italic">Sẽ tính sau</span> : item.DiemChu || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Xác nhận mật khẩu khi Lưu */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-hover rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden transform transition-all">
            <div className="flex justify-between items-center p-5 border-b border-surface-hover">
              <h3 className="text-lg font-bold text-semantic-warning flex items-center gap-2">
                🔒 Xác thực bảo mật
              </h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-text-muted hover:text-semantic-error transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleConfirmSave} className="p-6">
              <p className="text-text-primary text-sm mb-4">
                Dữ liệu điểm hiện đang được lưu tạm trên RAM. Bạn đang chuẩn bị ghi điểm thật vào Cơ sở dữ liệu cho <strong>{Object.keys(editedDiem).length} sinh viên</strong>.
              </p>
              <p className="text-text-muted text-xs mb-4">
                Vui lòng nhập mật khẩu tài khoản của bạn để xác nhận hành động này.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-muted mb-2">Mật khẩu xác nhận</label>
                <input 
                  type="password" 
                  autoFocus
                  required
                  className="w-full bg-canvas border border-surface-hover rounded-lg px-4 py-2 text-text-primary focus:border-semantic-warning outline-none shadow-inner"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <button type="submit" className="w-full py-2 rounded-lg font-bold bg-semantic-warning text-black hover:bg-semantic-warning/90 transition-colors shadow-lg shadow-semantic-warning/20">
                Xác nhận Lưu Điểm
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

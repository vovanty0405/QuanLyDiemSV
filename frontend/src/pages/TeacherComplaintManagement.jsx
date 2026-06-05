import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, CheckCircle, XCircle, Clock, Save, Edit3, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient';

export default function TeacherComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  const [formData, setFormData] = useState({
    newGrade: '',
    feedback: ''
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/khieunai');
      setComplaints(res.data || []);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách khiếu nại');
    } finally {
      setLoading(false);
    }
  };

  const complaintsArray = Array.isArray(complaints) ? complaints : [];
  const selectedComplaint = complaintsArray.find(c => c.id === selectedComplaintId);

  const handleSelectComplaint = (complaint) => {
    setSelectedComplaintId(complaint.id);
    const oldGrades = complaint.oldGrades || {};
    setFormData({
      newGrade: oldGrades[complaint.appealedGrade] || '',
      feedback: complaint.feedback || ''
    });
  };

  const handleProcess = async (status) => {
    if (!selectedComplaint) return;
    
    if (status === 'approved' && formData.newGrade === '') {
      toast.error('Vui lòng nhập điểm mới để duyệt');
      return;
    }

    if (status === 'rejected' && !formData.feedback) {
      toast.error('Vui lòng nhập phản hồi lý do từ chối');
      return;
    }

    try {
      await axiosClient.put(`/khieunai/${selectedComplaint.id}/process`, {
        status,
        newGrade: formData.newGrade,
        feedback: formData.feedback
      });

      toast.success(status === 'approved' ? 'Đã duyệt khiếu nại và cập nhật điểm' : 'Đã từ chối khiếu nại');
      setSelectedComplaintId(null);
      fetchComplaints(); // Tải lại danh sách
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi xử lý');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#df7412]/10 text-[#df7412] border border-[#df7412]/20"><Clock size={12} /> Chờ xử lý</span>;
      case 'approved': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"><CheckCircle size={12} /> Đã duyệt</span>;
      case 'rejected': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/20"><XCircle size={12} /> Từ chối</span>;
      default: return null;
    }
  };

  const getGradeLabel = (key) => {
    const labels = {
      quatrinh: 'Điểm Quá Trình',
      cuoiky: 'Điểm Cuối Kỳ',
      thiLan1: 'Điểm Thi Lần 1',
      thiLan2: 'Điểm Thi Lần 2'
    };
    return labels[key] || key;
  };

  const filteredComplaints = complaintsArray.filter(c => 
    (c?.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c?.studentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c?.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredComplaints.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Quản lý Khiếu Nại & Phúc Khảo</h2>
          <p className="text-text-muted mt-1 text-sm">Xử lý các yêu cầu xem lại điểm từ sinh viên</p>
        </div>
      </div>

      {/* TOP: Danh sách khiếu nại */}
      <div className="bg-surface border border-surface-hover rounded-xl shadow-sm flex flex-col max-h-[500px]">
        <div className="p-4 border-b border-surface-hover flex justify-between items-center bg-[#191b23] rounded-t-xl">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <AlertCircle size={18} className="text-[#df7412]" /> 
            Danh sách đơn khiếu nại
          </h3>
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Tìm mã đơn, MSSV, tên..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-canvas border border-surface-hover rounded-lg pl-9 pr-4 py-1.5 text-sm text-text-primary focus:border-primary outline-none transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#191b23] z-10">
              <tr className="border-b border-surface-hover text-text-muted text-xs uppercase tracking-wider">
                <th className="px-5 py-3 font-semibold">Mã Đơn</th>
                <th className="px-5 py-3 font-semibold">Sinh Viên</th>
                <th className="px-5 py-3 font-semibold">Môn Học</th>
                <th className="px-5 py-3 font-semibold max-w-xs">Lý Do</th>
                <th className="px-5 py-3 font-semibold">Ngày Gửi</th>
                <th className="px-5 py-3 font-semibold text-center">Trạng Thái</th>
                <th className="px-5 py-3 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-hover text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={24}/></td>
                </tr>
              ) : filteredComplaints.length > 0 ? currentItems.map(complaint => (
                <tr 
                  key={complaint.id} 
                  className={`transition-colors cursor-pointer ${selectedComplaintId === complaint.id ? 'bg-primary/10' : 'hover:bg-surface-hover/40'}`}
                  onClick={() => handleSelectComplaint(complaint)}
                >
                  <td className="px-5 py-4 font-medium text-text-primary">KN-{complaint.id}</td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-text-primary">{complaint.studentName}</div>
                    <div className="text-xs text-text-muted mt-0.5">{complaint.studentId}</div>
                  </td>
                  <td className="px-5 py-4 text-text-primary">{complaint.courseName}</td>
                  <td className="px-5 py-4 max-w-xs truncate text-text-muted" title={complaint.reason}>
                    {complaint.reason}
                  </td>
                  <td className="px-5 py-4 text-text-muted">{new Date(complaint.submitDate).toLocaleDateString('vi-VN')}</td>
                  <td className="px-5 py-4 text-center">{getStatusBadge(complaint.status)}</td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      className={`p-1.5 rounded transition-colors ${selectedComplaintId === complaint.id ? 'bg-primary text-white' : 'text-primary hover:bg-primary/10'}`}
                    >
                      <Edit3 size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-text-muted">Không tìm thấy đơn khiếu nại nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 0 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-surface-hover bg-[#191b23] rounded-b-xl">
                <span className="text-xs text-text-muted">
                    Hiển thị {indexOfFirstItem + 1} đến {Math.min(indexOfLastItem, filteredComplaints.length)} trong tổng số {filteredComplaints.length} đơn
                </span>
                <div className="flex gap-1">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className="px-2 py-1 text-xs rounded bg-surface border border-surface-hover text-text-primary hover:bg-surface-hover disabled:opacity-50 transition-colors"
                    >
                        Trước
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
                                className={`px-2 py-1 text-xs rounded border ${currentPage === pageNum ? 'bg-primary border-primary text-white' : 'bg-surface border-surface-hover text-text-primary hover:bg-surface-hover'} transition-colors`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    
                    <button 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        className="px-2 py-1 text-xs rounded bg-surface border border-surface-hover text-text-primary hover:bg-surface-hover disabled:opacity-50 transition-colors"
                    >
                        Sau
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* BOTTOM: Form Xử lý */}
      <div className={`bg-surface border rounded-xl shadow-sm transition-all duration-300 ${selectedComplaintId ? 'border-primary ring-1 ring-primary/20' : 'border-surface-hover opacity-60 pointer-events-none'}`}>
        <div className="p-4 border-b border-surface-hover flex justify-between items-center bg-[#191b23] rounded-t-xl">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <Edit3 size={18} className="text-primary" /> 
            Chi tiết & Xử lý khiếu nại
          </h3>
          {selectedComplaintId && (
            <button onClick={() => setSelectedComplaintId(null)} className="text-text-muted hover:text-white transition-colors">
              <X size={18} />
            </button>
          )}
        </div>

        {selectedComplaint ? (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cột 1: Thông tin đơn */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-canvas p-4 rounded-lg border border-surface-hover">
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Thông tin Sinh Viên</div>
                <div className="font-medium text-text-primary text-lg mb-1">{selectedComplaint.studentName}</div>
                <div className="text-sm text-text-muted mb-3">{selectedComplaint.studentId} | Lớp: D21CQCN01-N</div>
                
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 mt-4">Môn Học & Loại Điểm</div>
                <div className="font-medium text-primary text-sm mb-1">{selectedComplaint.courseName}</div>
                <div className="text-sm text-text-primary mb-3">Khiếu nại: <span className="font-bold text-[#df7412]">{getGradeLabel(selectedComplaint.appealedGrade)}</span></div>
                
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 mt-4">Lý do khiếu nại</div>
                <div className="text-sm text-text-primary italic bg-surface p-3 rounded border border-surface-hover border-l-4 border-l-[#df7412]">
                  "{selectedComplaint.reason}"
                </div>
              </div>
            </div>

            {/* Cột 2: Cập nhật điểm & Phản hồi */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  1. Rà soát điểm số hiện tại
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(selectedComplaint.oldGrades || { quatrinh: null, cuoiky: null, thiLan1: null, thiLan2: null }).map(([key, val]) => (
                    <div key={key} className={`bg-canvas border rounded-lg p-3 text-center ${key === selectedComplaint.appealedGrade ? 'border-[#df7412]' : 'border-surface-hover'}`}>
                      <div className="text-xs text-text-muted mb-1">{getGradeLabel(key)}</div>
                      <div className={`text-xl font-bold ${key === selectedComplaint.appealedGrade ? 'text-[#df7412]' : 'text-text-primary'}`}>
                        {val !== null && val !== undefined ? val : '--'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedComplaint.status === 'pending' ? (
                <>
                  <div className="bg-canvas p-5 rounded-lg border border-primary/30">
                    <h4 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                      2. Cập nhật Điểm Mới (Dành cho {getGradeLabel(selectedComplaint.appealedGrade)})
                    </h4>
                    <div className="w-48">
                      <label className="block text-xs font-medium text-text-muted mb-1.5">Nhập điểm mới</label>
                      <input 
                        type="number" 
                        min="0" max="10" step="0.1"
                        value={formData.newGrade}
                        onChange={(e) => setFormData({...formData, newGrade: e.target.value})}
                        className="w-full bg-surface border border-surface-hover rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none"
                        placeholder="VD: 8.5"
                      />
                      <p className="text-[11px] text-text-muted mt-2">Lưu ý: Backend sẽ tự động kiểm tra giới hạn điểm (ví dụ: thi lại tối đa 6.0 điểm).</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-3">3. Phản hồi cho Sinh viên</h4>
                    <textarea 
                      value={formData.feedback}
                      onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                      className="w-full h-24 bg-canvas border border-surface-hover rounded-lg p-3 text-sm text-text-primary focus:border-primary outline-none resize-none"
                      placeholder="Nhập lý do duyệt/từ chối để sinh viên nắm thông tin..."
                    ></textarea>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button 
                      onClick={() => handleProcess('rejected')}
                      className="px-5 py-2.5 rounded-lg font-medium text-sm border border-[#ffb4ab] text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-colors flex items-center gap-2"
                    >
                      <XCircle size={16} /> Từ chối khiếu nại
                    </button>
                    <button 
                      onClick={() => handleProcess('approved')}
                      className="px-5 py-2.5 rounded-lg font-medium text-sm bg-[#10B981] text-black hover:bg-[#0ea5e9] transition-colors flex items-center gap-2 shadow-lg shadow-[#10B981]/20"
                    >
                      <CheckCircle size={16} /> Duyệt & Cập nhật điểm
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-canvas p-6 rounded-lg border border-surface-hover flex flex-col items-center justify-center text-center h-48">
                  {getStatusBadge(selectedComplaint.status)}
                  <p className="text-text-primary font-medium mt-4">Đơn khiếu nại này đã được xử lý.</p>
                  <p className="text-sm text-text-muted mt-2 max-w-md">Phản hồi: "{selectedComplaint.feedback}"</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-text-muted">
            <AlertCircle size={48} className="opacity-20 mb-4" />
            <p>Vui lòng chọn một đơn khiếu nại từ danh sách bên trên để xem chi tiết và xử lý.</p>
          </div>
        )}
      </div>
    </div>
  );
}

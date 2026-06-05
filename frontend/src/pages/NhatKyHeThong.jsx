import React, { useState, useEffect } from 'react';
import { Database, RotateCcw, FileText, Sheet, Search, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

const FilterBar = ({ filters, setFilters, onSearch, onClear }) => {
  return (
    <div className="bg-surface p-4 rounded-lg border border-surface-hover mb-6">
      {/* Dòng 1: System Actions */}
      <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-surface-hover">
        <button 
          onClick={() => toast.success('Đang thực hiện sao lưu dữ liệu...')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Database size={16} /> Sao lưu dữ liệu (Backup)
        </button>
        <button 
          onClick={() => toast.error('Tính năng phục hồi cần xác thực cấp cao')}
          className="flex items-center gap-2 px-4 py-2 bg-transparent border border-semantic-error text-semantic-error rounded-lg text-sm font-medium hover:bg-semantic-error/10 transition-colors"
        >
          <RotateCcw size={16} /> Phục hồi dữ liệu (Restore)
        </button>
        <button 
          onClick={() => toast.success('Đã xuất file log.txt')}
          className="flex items-center gap-2 px-4 py-2 bg-transparent border border-surface-hover text-text-muted rounded-lg text-sm font-medium hover:text-primary hover:border-primary transition-colors"
        >
          <FileText size={16} /> Xuất file TXT
        </button>
        <button 
          onClick={() => toast.success('Đã xuất file log.xlsx')}
          className="flex items-center gap-2 px-4 py-2 bg-transparent border border-surface-hover text-text-muted rounded-lg text-sm font-medium hover:text-primary hover:border-primary transition-colors"
        >
          <Sheet size={16} /> Xuất Excel
        </button>
      </div>

      {/* Dòng 2: Search Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="w-40">
          <label className="block text-xs text-text-muted mb-1">Tên tài khoản</label>
          <input 
            type="text" 
            placeholder="Tên tài khoản..."
            value={filters.account}
            onChange={(e) => setFilters({...filters, account: e.target.value})}
            className="w-full bg-canvas border border-surface-hover text-text-primary px-3 py-2 rounded-lg text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="w-40">
          <label className="block text-xs text-text-muted mb-1">Hành động</label>
          <input 
            type="text" 
            placeholder="Ví dụ: Thêm, Sửa..."
            value={filters.action}
            onChange={(e) => setFilters({...filters, action: e.target.value})}
            className="w-full bg-canvas border border-surface-hover text-text-primary px-3 py-2 rounded-lg text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="w-32">
          <label className="block text-xs text-text-muted mb-1">Loại</label>
          <select 
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="w-full bg-canvas border border-surface-hover text-text-primary px-3 py-2 rounded-lg text-sm outline-none focus:border-primary"
          >
            <option value="">Tất cả</option>
            <option value="Thông tin">Thông tin</option>
            <option value="Cảnh báo">Cảnh báo</option>
            <option value="Lỗi">Lỗi</option>
          </select>
        </div>
        <div className="w-40">
          <label className="block text-xs text-text-muted mb-1">Thời gian</label>
          <input 
            type="date" 
            value={filters.time}
            onChange={(e) => setFilters({...filters, time: e.target.value})}
            className="w-full bg-canvas border border-surface-hover text-text-primary px-3 py-2 rounded-lg text-sm outline-none focus:border-primary"
            style={{ colorScheme: 'dark' }}
          />
        </div>
        <div className="flex-grow min-w-[200px]">
          <label className="block text-xs text-text-muted mb-1">Mô tả chi tiết</label>
          <input 
            type="text" 
            placeholder="Tìm theo mô tả..."
            value={filters.description}
            onChange={(e) => setFilters({...filters, description: e.target.value})}
            className="w-full bg-canvas border border-surface-hover text-text-primary px-3 py-2 rounded-lg text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onClear}
            className="flex items-center gap-1.5 px-4 py-2 bg-canvas border border-surface-hover text-text-muted hover:bg-surface-hover rounded-lg text-sm font-medium transition-colors"
          >
            <X size={16} /> Xóa lọc
          </button>
          <button 
            onClick={onSearch}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 border border-primary text-primary hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors"
          >
            <Search size={16} /> Tìm kiếm
          </button>
        </div>
      </div>
    </div>
  );
};

const LogTable = ({ logs, currentPage, totalPages, setCurrentPage }) => {
  return (
    <div className="bg-surface border border-surface-hover rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-surface-hover bg-[#191b23]">
        <h3 className="font-semibold text-text-primary">Danh sách nhật ký hệ thống</h3>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#191b23] text-text-muted text-xs uppercase tracking-wider border-b border-surface-hover">
              <th className="px-4 py-3 font-medium w-12 text-center">ID</th>
              <th className="px-4 py-3 font-medium w-40">Tên tài khoản</th>
              <th className="px-4 py-3 font-medium w-48">Hành động</th>
              <th className="px-4 py-3 font-medium w-32">Loại</th>
              <th className="px-4 py-3 font-medium w-48">Thời gian</th>
              <th className="px-4 py-3 font-medium">Mô tả</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-text-muted">
                  Không tìm thấy nhật ký nào phù hợp.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const isWarning = log.type === 'Cảnh báo';
                const isError = log.type === 'Lỗi';
                
                return (
                  <tr 
                    key={log.id} 
                    className={`
                      border-b border-surface-hover
                      ${isWarning ? 'bg-[#df7412]/10 hover:bg-[#df7412]/20' : 
                        isError ? 'bg-[#ffb4ab]/10 hover:bg-[#ffb4ab]/20' : 
                        'even:bg-canvas bg-surface hover:bg-surface-hover/30'
                      }
                      transition-colors
                    `}
                  >
                    <td className="px-4 py-3 text-center text-text-muted">{log.id}</td>
                    <td className="px-4 py-3 font-medium text-text-primary">{log.account}</td>
                    <td className="px-4 py-3 text-text-primary">{log.action}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        isWarning ? 'bg-[#df7412]/10 text-[#df7412] border-[#df7412]/30' :
                        isError ? 'bg-[#ffb4ab]/10 text-[#ffb4ab] border-[#ffb4ab]/30' :
                        'bg-primary/10 text-primary border-primary/30'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs">{log.time}</td>
                    <td className="px-4 py-3 text-text-muted">
                      {log.description?.length > 50 ? (
                        <div className="flex items-center gap-2">
                          <span title={log.description}>{log.description.substring(0, 50)}...</span>
                          <button 
                            onClick={() => toast((t) => (
                              <div>
                                <h4 className="font-bold text-primary mb-2">Chi tiết log #{log.id}</h4>
                                <p className="text-sm">{log.description}</p>
                                <button onClick={() => toast.dismiss(t.id)} className="mt-3 px-3 py-1 bg-surface border border-surface-hover rounded text-xs">Đóng</button>
                              </div>
                            ), { duration: 10000 })}
                            className="p-1 hover:text-primary transition-colors flex items-center justify-center bg-surface-hover rounded"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      ) : log.description}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="p-4 border-t border-surface-hover bg-surface flex items-center justify-between">
          <span className="text-sm text-text-muted">
            Trang <span className="font-semibold text-text-primary">{currentPage}</span> / {totalPages}
          </span>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-1.5 rounded bg-canvas border border-surface-hover text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-1.5 rounded bg-canvas border border-surface-hover text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function NhatKyHeThong() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ account: '', action: '', type: '', time: '', description: '' });
  const [appliedFilters, setAppliedFilters] = useState({ account: '', action: '', type: '', time: '', description: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axiosClient.get('/nhatkyhoatdong');
        setLogs(res.data);
      } catch (error) {
        toast.error('Lỗi khi tải nhật ký hoạt động');
      }
    };
    fetchLogs();
  }, []);

  const handleSearch = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handleClear = () => {
    const empty = { account: '', action: '', type: '', time: '', description: '' };
    setFilters(empty);
    setAppliedFilters(empty);
    setCurrentPage(1);
  };

  // Lọc dữ liệu dựa trên appliedFilters
  const filteredLogs = logs.filter(log => {
    return (
      (appliedFilters.account === '' || log.account?.toLowerCase().includes(appliedFilters.account.toLowerCase())) &&
      (appliedFilters.action === '' || log.action?.toLowerCase().includes(appliedFilters.action.toLowerCase())) &&
      (appliedFilters.type === '' || log.type === appliedFilters.type) &&
      (appliedFilters.description === '' || log.description?.toLowerCase().includes(appliedFilters.description.toLowerCase())) &&
      (appliedFilters.time === '' || log.time?.includes(appliedFilters.time)) // Match tương đối
    );
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-[1600px] mx-auto w-full flex flex-col h-[calc(100vh-100px)]">
      <FilterBar 
        filters={filters} 
        setFilters={setFilters} 
        onSearch={handleSearch} 
        onClear={handleClear} 
      />
      
      <div className="flex-1 min-h-0">
        <LogTable 
          logs={paginatedLogs} 
          currentPage={currentPage} 
          totalPages={totalPages} 
          setCurrentPage={setCurrentPage} 
        />
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Search, Save, X, ShieldCheck, ShieldAlert, CheckSquare, Square, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const DATA_SCOPES = [
  { id: 'scope_diem_canhan', module: 'Tra cứu điểm', rule: 'Chỉ xem điểm của cá nhân' },
  { id: 'scope_diem_gv', module: 'Tra cứu điểm', rule: 'Chỉ xem sinh viên lớp mình phụ trách' },
  { id: 'scope_diem_all', module: 'Tra cứu điểm', rule: 'Xem toàn trường' },
  { id: 'scope_thongke_canhan', module: 'Thống kê', rule: 'Thống kê cá nhân' },
  { id: 'scope_thongke_all', module: 'Thống kê', rule: 'Thống kê toàn trường' },
];

const CustomCheckbox = ({ checked, onChange }) => {
  return (
    <div 
      onClick={onChange} 
      className="cursor-pointer inline-flex items-center justify-center p-1 rounded hover:bg-surface-hover/80 transition-colors"
    >
      {checked ? (
        <CheckSquare size={20} className="text-primary" />
      ) : (
        <Square size={20} className="text-text-muted opacity-60" />
      )}
    </div>
  );
};

export default function PhanQuyenChiTiet() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [selectedRoleId, setSelectedRoleId] = useState(Number(id) || 1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [actions, setActions] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [scopes, setScopes] = useState({});

  useEffect(() => {
    axios.get('http://localhost:3000/api/phanquyen/roles')
      .then(res => setRoles(res.data.data))
      .catch(err => toast.error('Lỗi tải nhóm quyền'));
  }, []);

  useEffect(() => {
    if (!selectedRoleId) return;
    
    // Fetch permissions
    axios.get(`http://localhost:3000/api/phanquyen/${selectedRoleId}/permissions`)
      .then(res => {
        setModules(res.data.data.modules);
        setActions(res.data.data.actions);
        setPermissions(res.data.data.permissions);
      })
      .catch(err => toast.error('Lỗi tải phân quyền'));
      
    // Fetch scopes
    axios.get(`http://localhost:3000/api/phanquyen/${selectedRoleId}/scopes`)
      .then(res => {
        const scopesData = res.data.data;
        const initialScopes = {};
        DATA_SCOPES.forEach(s => {
          initialScopes[s.id] = scopesData[s.id] || false;
        });
        setScopes(initialScopes);
      });
  }, [selectedRoleId]);

  // Helpers toggle
  const toggleSinglePermission = (moduleId, actionId) => {
    setPermissions(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [actionId]: !prev[moduleId][actionId]
      }
    }));
  };

  const toggleRow = (moduleId) => {
    setPermissions(prev => {
      const row = prev[moduleId];
      const allChecked = actions.every(act => row[act.id]);
      const newState = { ...prev, [moduleId]: { ...row } };
      actions.forEach(act => {
        newState[moduleId][act.id] = !allChecked;
      });
      return newState;
    });
  };

  const toggleColumn = (actionId) => {
    setPermissions(prev => {
      const filteredModules = modules.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const allChecked = filteredModules.every(mod => prev[mod.id][actionId]);
      
      const newState = { ...prev };
      filteredModules.forEach(mod => {
        newState[mod.id] = {
          ...newState[mod.id],
          [actionId]: !allChecked
        };
      });
      return newState;
    });
  };

  const grantAll = () => {
    setPermissions(prev => {
      const newState = { ...prev };
      modules.forEach(mod => {
        newState[mod.id] = {};
        actions.forEach(act => {
          newState[mod.id][act.id] = true;
        });
      });
      return newState;
    });
    setScopes(prev => {
      const newState = { ...prev };
      DATA_SCOPES.forEach(s => newState[s.id] = true);
      return newState;
    });
    toast.success('Đã cấp toàn bộ quyền');
  };

  const revokeAll = () => {
    setPermissions(prev => {
      const newState = { ...prev };
      modules.forEach(mod => {
        newState[mod.id] = {};
        actions.forEach(act => {
          newState[mod.id][act.id] = false;
        });
      });
      return newState;
    });
    setScopes(prev => {
      const newState = { ...prev };
      DATA_SCOPES.forEach(s => newState[s.id] = false);
      return newState;
    });
    toast.success('Đã thu hồi toàn bộ quyền');
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:3000/api/phanquyen/${selectedRoleId}/permissions`, { permissions });
      await axios.put(`http://localhost:3000/api/phanquyen/${selectedRoleId}/scopes`, { scopes });
      toast.success('Lưu cấu hình phân quyền thành công!');
    } catch (error) {
      toast.error('Lỗi khi lưu phân quyền');
    }
  };

  const filteredModules = modules.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const roleName = roles.find(r => r.id === selectedRoleId)?.name || 'Không xác định';

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* 1. Top Bar */}
      <div className="bg-surface border-b border-surface-hover px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link to="/tai-khoan" className="p-2 -ml-2 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="text-xs text-text-muted font-medium mb-1">Thiết lập quyền hạn</div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-text-primary">Phân quyền chi tiết:</h1>
              <select 
                value={selectedRoleId} 
                onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                className="bg-canvas border border-surface-hover rounded-lg px-3 py-1.5 text-sm font-semibold text-primary focus:border-primary outline-none cursor-pointer"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="relative min-w-[250px] flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Tìm tên chức năng..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-canvas border border-surface-hover rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary focus:border-primary outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={grantAll} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-[#10B981]/50 text-[#10B981] hover:bg-[#10B981]/10 transition-colors">
            <ShieldCheck size={16} /> Thêm toàn quyền
          </button>
          <button onClick={revokeAll} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-[#ffb4ab]/50 text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-colors">
            <ShieldAlert size={16} /> Xóa toàn quyền
          </button>
          <div className="w-px h-6 bg-surface-hover mx-1"></div>
          <button onClick={() => navigate('/tai-khoan')} className="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-surface-hover transition-colors">
            Hủy bỏ
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
            <Save size={16} /> Lưu Phân Quyền
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        
        {/* 2. Bảng Ma Trận Phân Quyền */}
        <div className="bg-surface rounded-xl border border-surface-hover shadow-sm overflow-hidden flex flex-col max-h-[600px]">
          <div className="p-4 border-b border-surface-hover bg-[#191b23] flex items-center justify-between sticky top-0 z-10">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2 uppercase tracking-wider">
              <ShieldCheck size={18} className="text-primary" />
              Ma trận Phân Quyền Tính Năng
            </h2>
          </div>
          
          <div className="overflow-auto custom-scrollbar flex-1 relative">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#191b23] border-b border-surface-hover shadow-sm">
                  <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider w-[250px] border-r border-surface-hover bg-[#191b23]">
                    Tên Chức Năng
                  </th>
                  {actions.map(act => {
                    const isAllChecked = filteredModules.length > 0 && filteredModules.every(m => permissions[m.id]?.[act.id]);
                    return (
                      <th key={act.id} className="p-4 font-semibold text-text-muted text-xs tracking-wider text-center bg-[#191b23]">
                        <div className="flex flex-col items-center gap-2">
                          <span className="uppercase">{act.name}</span>
                          <CustomCheckbox checked={isAllChecked} onChange={() => toggleColumn(act.id)} />
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-hover text-sm">
                {filteredModules.length === 0 ? (
                  <tr>
                    <td colSpan={actions.length + 1} className="p-8 text-center text-text-muted">Không tìm thấy chức năng nào phù hợp</td>
                  </tr>
                ) : (
                  filteredModules.map((mod) => {
                    const isRowChecked = actions.every(act => permissions[mod.id]?.[act.id]);
                    return (
                      <tr key={mod.id} className="hover:bg-surface-hover/40 transition-colors group">
                        <td className="p-4 border-r border-surface-hover font-medium text-text-primary flex items-center justify-between">
                          {mod.name}
                          <CustomCheckbox checked={isRowChecked} onChange={() => toggleRow(mod.id)} />
                        </td>
                        {actions.map(act => (
                          <td key={act.id} className="p-4 text-center">
                            <CustomCheckbox 
                              checked={permissions[mod.id]?.[act.id] || false} 
                              onChange={() => toggleSinglePermission(mod.id, act.id)} 
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Bảng Phạm Vi Dữ Liệu */}
        <div className="bg-surface rounded-xl border border-surface-hover shadow-sm overflow-hidden">
          <div className="p-4 border-b border-surface-hover bg-[#191b23]">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2 uppercase tracking-wider">
              <ShieldCheck size={18} className="text-[#10B981]" />
              Phạm Vi Dữ Liệu (Data Scope)
            </h2>
            <p className="text-xs text-text-muted mt-1 ml-6">Giới hạn dữ liệu mà Role này được phép thao tác/nhìn thấy.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#191b23] border-b border-surface-hover text-text-muted text-[11px] uppercase tracking-wider">
                  <th className="px-6 py-3 font-semibold w-[250px]">Chức năng</th>
                  <th className="px-6 py-3 font-semibold">Phạm vi áp dụng (Rule)</th>
                  <th className="px-6 py-3 font-semibold text-center w-32">Áp dụng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-hover text-sm">
                {DATA_SCOPES.map(scope => (
                  <tr key={scope.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-text-primary">{scope.module}</td>
                    <td className="px-6 py-3.5 text-text-muted">{scope.rule}</td>
                    <td className="px-6 py-3.5 text-center">
                      <CustomCheckbox 
                        checked={scopes[scope.id]} 
                        onChange={() => setScopes(prev => ({ ...prev, [scope.id]: !prev[scope.id] }))} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}


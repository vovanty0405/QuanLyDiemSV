import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, GraduationCap, Presentation, BookOpen, FileDigit, UserCircle, LineChart, LogOut, Search, Building, MessageSquare, Database, ChevronDown, ChevronRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const menuItems = [
  { id: 'dashboard', label: 'Trang chủ', icon: Home, path: '/' },
  { id: 'sinhvien', label: 'Sinh viên', icon: Users, path: '/sinh-vien' },
  { id: 'giangvien', label: 'Giảng viên', icon: GraduationCap, path: '/giang-vien' },
  { 
    id: 'daotao', label: 'Quản lý đào tạo', icon: BookOpen, subMenu: [
      { id: 'lophanhchinh', label: 'Lớp hành chính', path: '/lop-hanh-chinh' },
      { id: 'lophocphan', label: 'Lớp học phần', path: '/lop-hoc-phan' },
      { id: 'monhoc', label: 'Môn học', path: '/mon-hoc' },
      { id: 'khungdaotao', label: 'Khung đào tạo', path: '/khung-dao-tao' },
    ]
  },
  { 
    id: 'diem', label: 'Quản lý điểm', icon: FileDigit, subMenu: [
      { id: 'diemso', label: 'Điểm số', path: '/diem-so' },
      { id: 'tracuudiem', label: 'Tra cứu điểm', path: '/tra-cuu-diem' },
      { id: 'khieunai', label: 'Khiếu nại', path: '/khieu-nai' },
    ]
  },
  { id: 'thongke', label: 'Thống kê', icon: LineChart, path: '/thong-ke' },
  { 
    id: 'hethong', label: 'Hệ thống', icon: Database, subMenu: [
      { id: 'taikhoan', label: 'Tài khoản', path: '/tai-khoan' },
      { id: 'nhatkyhethong', label: 'Nhật ký hệ thống', path: '/nhat-ky-he-thong' },
    ]
  },
];

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [allowedModules, setAllowedModules] = React.useState({});
  const [openGroups, setOpenGroups] = React.useState({});

  // Tự động mở group nếu đang ở một trang con
  React.useEffect(() => {
    const currentPath = location.pathname;
    const newOpenGroups = { ...openGroups };
    menuItems.forEach(item => {
      if (item.subMenu) {
        const isChildActive = item.subMenu.some(child => currentPath.startsWith(child.path));
        if (isChildActive) {
          newOpenGroups[item.id] = true;
        }
      }
    });
    setOpenGroups(newOpenGroups);
    // eslint-disable-next-line
  }, [location.pathname]);

  const toggleGroup = (groupId) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  React.useEffect(() => {
    if (user?.RoleID) {
      axios.get(`http://localhost:3000/api/phanquyen/${user.RoleID}/permissions`)
        .then(res => {
          const perms = res.data.data.permissions;
          const allowed = {};
          // A module is allowed if it has any true permission (like 'view')
          Object.keys(perms).forEach(mod => {
            allowed[mod] = Object.values(perms[mod]).some(val => val === true);
          });
          // Also allow specific ones that might not be in RBAC table yet for admin or specific roles if needed,
          // but for now let's just rely on RBAC.
          setAllowedModules(allowed);
        })
        .catch(console.error);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-[260px] h-screen bg-surface border-r border-surface-hover flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-text-primary tracking-wide">EduFlow<span className="text-primary">/</span>GradeSys</h1>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            let isAdmin = user?.RoleID === 1;

            const checkPermission = (id) => {
                if (isAdmin) return true;
                if (id === 'dashboard') return true; // Luôn mở dashboard
                
                const dbModuleMap = {
                    'sinhvien': 'taikhoan',
                    'giangvien': 'taikhoan',
                    'nhatkyhethong': 'taikhoan'
                };
                const checkId = dbModuleMap[id] || id;
                return allowedModules[checkId] === true;
            };

            let isAllowed = false;
            let filteredSubMenu = null;

            if (item.subMenu) {
                filteredSubMenu = item.subMenu.filter(child => checkPermission(child.id));
                if (filteredSubMenu.length > 0) {
                    isAllowed = true;
                }
            } else {
                isAllowed = checkPermission(item.id);
            }

            if (!isAllowed) return null;

            const Icon = item.icon;
            
            if (item.subMenu) {
              const isOpen = openGroups[item.id];
              const isChildActive = filteredSubMenu.some(child => location.pathname.startsWith(child.path));
              return (
                <li key={item.id}>
                  <div 
                    onClick={() => toggleGroup(item.id)}
                    className={`flex items-center justify-between px-6 py-3 cursor-pointer transition-colors border-l-4 ${
                      isChildActive && !isOpen ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:bg-surface-hover hover:text-text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={isChildActive && !isOpen ? 'text-primary' : 'text-text-muted'} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                  
                  {isOpen && (
                    <ul className="bg-canvas/50 py-1">
                      {filteredSubMenu.map(child => (
                        <li key={child.id}>
                          <NavLink
                            to={child.path}
                            className={({ isActive }) =>
                              `flex items-center gap-3 pl-12 pr-6 py-2.5 transition-colors border-l-4 ${
                                isActive 
                                  ? 'bg-primary/10 border-primary text-primary' 
                                  : 'text-text-muted hover:bg-surface-hover hover:text-text-primary border-transparent'
                              }`
                            }
                          >
                            <span className="text-sm font-medium">{child.label}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-6 py-3 transition-colors ${
                      isActive 
                        ? 'bg-primary/10 border-l-4 border-primary text-primary' 
                        : 'text-text-muted hover:bg-surface-hover hover:text-text-primary border-l-4 border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={20} className={isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-primary'} />
                      <span className="font-medium">{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-6 border-t border-surface-hover">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center">
              <UserCircle size={24} className="text-text-muted" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary truncate max-w-[100px]">
                {user?.Username || 'Admin'}
              </p>
              <p className="text-xs text-text-muted">
                {user?.RoleID === 1 ? 'Quản trị viên' : user?.RoleID === 2 ? 'Giảng viên' : 'Sinh viên'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-text-muted hover:text-semantic-error hover:bg-semantic-error/10 rounded transition-colors"
            title="Đăng xuất"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

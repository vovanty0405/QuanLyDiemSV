import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Settings, X } from 'lucide-react';

function ThemeSettingsDrawer({ isOpen, onClose }) {
  const { theme, setTheme, font, setFont } = useTheme();
  
  if (!isOpen) return null;
  
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>
      <div className="fixed top-0 right-0 h-full w-[350px] bg-surface border-l border-surface-hover shadow-xl z-50 flex flex-col transform transition-transform">
        <div className="flex items-center justify-between p-6 border-b border-surface-hover">
          <h2 className="text-xl font-bold text-text-primary">Cài đặt hiển thị</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-hover text-text-muted transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          {/* Section Font */}
          <div>
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Font chữ</h3>
            <div className="space-y-3">
              {['Inter', 'Segoe UI', 'Arial', 'Roboto'].map(f => (
                <label key={f} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input 
                      type="radio" 
                      name="font" 
                      value={f}
                      checked={font === f}
                      onChange={() => setFont(f)}
                      className="appearance-none w-5 h-5 rounded-full border border-surface-hover checked:border-primary transition-colors cursor-pointer"
                    />
                    {font === f && <div className="absolute w-2.5 h-2.5 rounded-full bg-primary pointer-events-none"></div>}
                  </div>
                  <span className="text-text-primary group-hover:text-primary transition-colors" style={{ fontFamily: f }}>{f}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Section Theme */}
          <div>
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Giao diện (Theme)</h3>
            <div className="space-y-3">
              {['light', 'dark', 'system'].map(t => (
                <label key={t} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input 
                      type="radio" 
                      name="theme" 
                      value={t}
                      checked={theme === t}
                      onChange={() => setTheme(t)}
                      className="appearance-none w-5 h-5 rounded-full border border-surface-hover checked:border-primary transition-colors cursor-pointer"
                    />
                    {theme === t && <div className="absolute w-2.5 h-2.5 rounded-full bg-primary pointer-events-none"></div>}
                  </div>
                  <span className="text-text-primary capitalize group-hover:text-primary transition-colors">
                    {t === 'light' ? 'Sáng' : t === 'dark' ? 'Tối' : 'Theo hệ thống'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Layout() {
  const { user, loading } = useContext(AuthContext);
  const { theme, setTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  if (loading) {
    return <div className="min-h-screen bg-canvas flex items-center justify-center text-text-muted">Đang tải...</div>;
  }

  // Bắt buộc đăng nhập
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Fixed Sidebar for desktop */}
      <div className="hidden lg:block w-[260px] flex-shrink-0 z-20">
        <Sidebar />
      </div>
      
      {/* Mobile header (shown only on small screens) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface border-b border-surface-hover flex items-center px-4 z-20">
        <h1 className="text-xl font-bold text-text-primary tracking-wide">EduFlow<span className="text-primary">/</span>GradeSys</h1>
      </div>
      
      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-x-hidden p-4 pt-20 lg:pt-4 lg:p-8 flex flex-col relative">
        <div className="absolute top-4 right-8 z-30 hidden lg:flex items-center gap-4">
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
            className="p-2 rounded-full hover:bg-surface-hover text-text-muted hover:text-primary transition-colors"
            title="Đổi giao diện"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full hover:bg-surface-hover text-text-muted hover:text-primary transition-colors"
            title="Cài đặt hiển thị"
          >
            <Settings size={20} />
          </button>
          <NotificationBell />
        </div>
        
        {/* Mobile topbar actions */}
        <div className="absolute top-3 right-4 z-30 lg:hidden flex items-center gap-2">
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 text-text-muted">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-text-muted">
            <Settings size={18} />
          </button>
          <NotificationBell />
        </div>
        
        <div className="flex-1 mt-6 lg:mt-4">
          <Outlet />
        </div>
      </main>

      <ThemeSettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

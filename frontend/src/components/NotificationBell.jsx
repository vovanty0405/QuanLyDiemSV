import React, { useState, useRef, useEffect, useContext } from 'react';
import { Bell, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.DaDoc).length : 0;

  useEffect(() => {
    if (user?.UserID) {
      fetchNotifications();

      const socket = io('http://localhost:3000');
      
      socket.on('connect', () => {
        socket.emit('join', user.UserID.toString());
      });

      socket.on('new_notification', (data) => {
        // Fetch lại thông báo để có full list hoặc tự prepend
        fetchNotifications();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user?.UserID]);

  const fetchNotifications = async () => {
    try {
      const res = await axiosClient.get('/thongbao');
      setNotifications(res.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      await axiosClient.post('/thongbao/mark-read');
      setNotifications(notifications.map(n => ({ ...n, DaDoc: true })));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={16} className="text-[#10B981]" />;
      case 'warning': return <AlertCircle size={16} className="text-[#df7412]" />;
      default: return <MessageSquare size={16} className="text-[#4d8eff]" />;
    }
  };

  const handleNotificationClick = async (notification) => {
      // Mark as read immediately in UI
      if (!notification.DaDoc) {
          setNotifications(prev => prev.map(n => n.MaThongBao === notification.MaThongBao ? { ...n, DaDoc: true } : n));
          axiosClient.post('/thongbao/mark-read').catch(console.error); // Đánh dấu đã đọc tất cả hoặc gọi API riêng
      }
      
      setIsOpen(false);

      const title = notification.TieuDe?.toLowerCase() || '';
      
      if (title.includes('có khiếu nại mới')) {
          navigate('/khieu-nai');
      } else if (title.includes('khiếu nại được duyệt') || title.includes('khiếu nại bị từ chối')) {
          navigate('/tra-cuu-diem');
      } else if (notification.LoaiThongBao === 'YeuCauMoKhoaDiem') {
          navigate('/lop-hoc-phan');
      } else if (notification.LoaiThongBao === 'HeThong' && title.includes('mở khóa')) {
          navigate('/diem-so');
      }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-full transition-colors focus:outline-none"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ffb4ab] text-[10px] font-bold text-black border-2 border-canvas">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-surface-hover rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-hover bg-[#191b23]">
            <h3 className="font-semibold text-text-primary">Thông báo</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-medium text-[#4d8eff] hover:underline"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>
          
          <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
            {Array.isArray(notifications) && notifications.length > 0 ? (
              <ul className="divide-y divide-[#32353c]">
                {notifications.map(notification => (
                  <li 
                    key={notification.MaThongBao} 
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-surface-hover/40 transition-colors cursor-pointer ${!notification.DaDoc ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5 shrink-0">
                        {getIcon(notification.LoaiThongBao)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className={`text-sm ${!notification.DaDoc ? 'font-semibold text-text-primary' : 'font-medium text-text-muted'}`}>
                          {notification.TieuDe}
                        </p>
                        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                          {notification.NoiDung}
                        </p>
                        <p className="text-[11px] text-text-muted mt-2">
                          {new Date(notification.NgayGui).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      {!notification.DaDoc && (
                        <div className="w-2 h-2 rounded-full bg-[#4d8eff] shrink-0 mt-1.5" />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-text-muted">
                <Bell size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">Bạn không có thông báo nào.</p>
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-surface-hover text-center bg-[#191b23]">
            <button className="text-sm font-medium text-[#4d8eff] hover:underline">
              Xem tất cả
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

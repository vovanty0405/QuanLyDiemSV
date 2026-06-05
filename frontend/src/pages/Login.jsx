import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Vui lòng nhập đầy đủ tài khoản và mật khẩu');
      return;
    }

    setIsSubmitting(true);
    const result = await login(username, password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Đăng nhập thành công!');
      navigate('/'); // Quay về trang chủ
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#10131a] relative flex items-center justify-center p-4">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#32353c 1px, transparent 1px), linear-gradient(90deg, #32353c 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#10131a] via-transparent to-[#10131a] pointer-events-none"></div>
      
      <div className="bg-[#1d2027] border border-[#32353c] w-full max-w-md rounded-2xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#e1e2ec] tracking-wide mb-2">
            EduFlow<span className="text-[#4d8eff]">/</span>GradeSys
          </h1>
          <p className="text-[#e1e2ec] font-semibold text-lg mb-1">Đăng nhập vào hệ thống</p>
          <p className="text-[#c2c6d6] text-sm">Vui lòng nhập tài khoản được cấp để tiếp tục.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#c2c6d6]">Tên đăng nhập / Mã số</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c2c6d6] group-focus-within:text-[#4d8eff] transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                className="w-full bg-[#10131a] border border-[#32353c] rounded-lg pl-10 pr-4 py-3 text-[#e1e2ec] focus:outline-none focus:border-[#4d8eff] focus:ring-1 focus:ring-[#4d8eff] transition-all"
                placeholder="Nhập tài khoản..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#c2c6d6]">Mật khẩu</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c2c6d6] group-focus-within:text-[#4d8eff] transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-[#10131a] border border-[#32353c] rounded-lg pl-10 pr-12 py-3 text-[#e1e2ec] focus:outline-none focus:border-[#4d8eff] focus:ring-1 focus:ring-[#4d8eff] transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#c2c6d6] hover:text-[#e1e2ec] transition-colors focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <div className="w-5 h-5 rounded border border-[#32353c] bg-[#10131a] peer-checked:bg-[#4d8eff] peer-checked:border-[#4d8eff] transition-colors flex items-center justify-center">
                  <svg className="w-3 h-3 text-white fill-current opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/>
                  </svg>
                </div>
              </div>
              <span className="text-sm text-[#c2c6d6] group-hover:text-[#e1e2ec] transition-colors">Lưu mật khẩu</span>
            </label>
            <a href="#" className="text-sm text-[#4d8eff] hover:underline transition-all">
              Quên mật khẩu?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 bg-[#4d8eff] hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg transition-all shadow-[0_0_15px_rgba(77,142,255,0.3)] hover:shadow-[0_0_20px_rgba(77,142,255,0.5)] flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Đăng Nhập'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

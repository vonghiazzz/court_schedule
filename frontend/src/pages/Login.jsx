import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { toast } from "react-toastify";
import ZaloSupportWidget from '../components/ZaloSupportWidget';
// Import file CSS riêng vừa tạo ở bước 1 (Điều chỉnh lại đường dẫn file cho đúng cấu trúc thư mục của bạn)
import '../styles/login.css'; 

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Đăng nhập - Hệ thống Lịch Xét xử";
    
    // Nhúng dynamically Font Google nếu trong dự án của bạn chưa có sẵn tại index.html
    const linkFont = document.createElement('link');
    linkFont.href = "https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap";
    linkFont.rel = "stylesheet";
    document.head.appendChild(linkFont);
    
    return () => {
      // Dọn dẹp nếu cần
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const res = await axios.post('/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (res.data?.access_token) {
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('username', username);
        sessionStorage.setItem('justLoggedIn', 'true');
        window.dispatchEvent(new Event('storage'));
        if (onLoginSuccess) onLoginSuccess();
      } else {
        toast.warning("Đăng nhập thất bại! Token không hợp lệ.");
      }
    } catch (err) {
      toast.warning("❌ Đăng nhập thất bại! Vui lòng kiểm tra tài khoản và mật khẩu.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-body">
      
      {/* Header Điều hướng */}
      <header className="login-header">
        <div className="login-header-container">
          <div className="login-logo-group">
            <img alt="Court Logo" className="login-logo" src="/images/logoToaAn.jpg" onError={(e) => { e.target.src="https://lh3.googleusercontent.com/aida-public/AB6AXuBz_0sZJeQb0rTyfy4GK3u27JtAt0kqYDCFrxdOOr7Lg5PsjwSNSgQFeARptd9BzQ_cXUZmrisTIPVquU7zIe-XODa0oNCPCC93kXP9vMoMUyXveoLhlAcEpTbN3hQlXwLHUsNYaTQBxCpJI3qWONa9XY_07kLi40npERhS5XtuA9sGiPdRtSwbkq4-X3Q_J4BNy9Pn3ShYkpdStsARVNmQ1o9gB4RKU8d9tsKQ9uwVLfgo6naw5I2a" }} />
            <h1 className="login-title">
              HỆ THỐNG QUẢN LÝ LỊCH XÉT XỬ
            </h1>
          </div>
          <div className="login-header-right">
            <a 
              href="https://zalo.me/0582030018"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full font-bold no-underline hover:bg-blue-100 transition-colors border border-blue-200"
              title="Gửi yêu cầu hỗ trợ qua Zalo"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              Zalo Hỗ Trợ: 0582030018 (Nghĩa)
            </a>
            <div className="lang-selector">
              <span className="material-symbols-outlined">language</span>
              <span className="lang-text">Tiếng Việt</span>
            </div>
          </div>
        </div>
      </header>

      {/* Vùng nội dung chính */}
      <main className="login-main">
        {/* Hình nền tòa án mờ phía sau */}
        <div 
          className="architecture-bg" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD0oBSsWLyxAj3i8vVWoQYtWXUD5ngr14Z7ZTi1W70VYLRJH7B54Ei4bxkyum8saDVuKhRxz_WlnO_vRhNCYkbGlHTFfYyy3GK0KROzideZldrjhgNtVe0HbSYuC8rGGvt5iYAdHkZGxt2AckpUmBL1KYkCwBUMToNoSfxvt_jbF54x_kbGqhRU75Ps3Mzc3egRRHBPaLV2S6l32YKrGsHxbwf29Pp6yOhxlECdQot8o7WYGc2dclE2')" }}
        ></div>

        {/* Khung Form đăng nhập chính */}
        <div className="login-card">
          <div className="login-card-strip"></div>
          <div className="login-card-body">
            
            <div className="login-card-header">
              <img alt="Court Logo" className="login-card-logo" src="/images/logoToaAn.jpg" onError={(e) => { e.target.src="https://lh3.googleusercontent.com/aida-public/AB6AXuBz_0sZJeQb0rTyfy4GK3u27JtAt0kqYDCFrxdOOr7Lg5PsjwSNSgQFeARptd9BzQ_cXUZmrisTIPVquU7zIe-XODa0oNCPCC93kXP9vMoMUyXveoLhlAcEpTbN3hQlXwLHUsNYaTQBxCpJI3qWONa9XY_07kLi40npERhS5XtuA9sGiPdRtSwbkq4-X3Q_J4BNy9Pn3ShYkpdStsARVNmQ1o9gB4RKU8d9tsKQ9uwVLfgo6naw5I2a" }} />
              <h2 className="login-card-title">Đăng nhập</h2>
              <p className="login-card-subtitle">Hệ thống Lịch Xét xử Toà án nhân dân</p>
            </div>

            <form onSubmit={handleLogin}>
              
              {/* Tài khoản */}
              <div className="form-group">
                <label className="form-label" htmlFor="username">
                  Tài khoản
                </label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">
                    person
                  </span>
                  <input 
                    className="form-input" 
                    id="username" 
                    type="text"
                    placeholder="Nhập tên tài khoản..." 
                    required 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Mật khẩu */}
              <div className="form-group">
                <div className="form-label-group">
                  <label className="form-label" htmlFor="password">
                    Mật khẩu
                  </label>
                </div>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">
                    lock
                  </span>
                  <input 
                    className="form-input" 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    className="password-toggle" 
                    onClick={() => setShowPassword(!showPassword)} 
                    type="button"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Thông báo bảo mật */}
              <div className="security-notice">
                <span className="material-symbols-outlined security-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
                  security
                </span>
                <p className="security-text">
                  Đây là hệ thống quản lý nội bộ. Vui lòng bảo mật thông tin tài khoản và đăng xuất sau khi sử dụng.
                </p>
              </div>

              {/* Nút submit */}
              <button 
                className="login-btn" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>  
            </form>

            {/* Support Notice */}
            <div className="mt-4 pt-3 border-t border-gray-100 text-center">
              <span className="text-xs text-gray-500">Mọi yêu cầu hỗ trợ tài khoản / hệ thống vui lòng gửi qua </span>
              <a 
                href="https://zalo.me/0582030018" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Zalo Quản lý: Nghĩa (0582030018)
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="login-footer">
        <div className="login-footer-container">
          <div>
            HỆ THỐNG LỊCH XÉT XỬ | © 2026
          </div>
          <div className="footer-links flex items-center gap-4 text-xs">
            <span>Quản lý website: <strong className="text-gray-800">Nghĩa</strong></span>
            <span>•</span>
            <span>Zalo hỗ trợ & nhận yêu cầu: <a href="https://zalo.me/0582030018" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">0582030018</a></span>
          </div>
        </div>
      </footer>

      {/* Floating Zalo Support Widget */}
      <ZaloSupportWidget />

    </div>
  );
}

export default Login;
// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from './pages/Login'
import JudgeCalendar from './pages/JudgeCalendar'
import JudgeStats from './pages/JudgeStats'
import JudgeManagement from './pages/JudgeManagement'
import JudgeOverview from './pages/JudgeOverview'
import UserManagement from './pages/UserManagement'
import CouncilManagement from './pages/CouncilManagement'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import api, { isTokenExpired } from './utils/axios';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "Không xác định");
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(token));

  // Cập nhật lại token nếu localStorage thay đổi (ví dụ sau khi đăng nhập)
  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem('token'));
      setUsername(localStorage.getItem("username") || "Không xác định");
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    let cancelled = false;

    const loadCurrentUser = async () => {
      if (!token) {
        setCurrentUser(null);
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      try {
        const response = await api.get('/me');
        if (!cancelled) {
          setCurrentUser(response.data);
          setUsername(response.data.username);
          localStorage.setItem('username', response.data.username);
        }
      } catch (error) {
        if (!cancelled) setCurrentUser(null);
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    };

    loadCurrentUser();
    return () => { cancelled = true; };
  }, [token]);

  // Kiểm tra thời gian hết hạn của token khi khởi động app và khi chuyển tab về ứng dụng
  useEffect(() => {
    const checkTokenExpiryAndValidity = async () => {
      const currentToken = localStorage.getItem('token');

      if (currentToken) {
        // 1. Kiểm tra nhanh ở client-side
        if (isTokenExpired(currentToken)) {
          // Vì refresh_token lưu ở HttpOnly Cookie không đọc được bằng JS,
          // chúng ta sẽ gọi thẳng api /me để kích hoạt luồng tự động làm mới của Axios Interceptor.
          try {
            await api.get('/me');
            return; // 🟢 Token đã được làm mới thành công ở bước 1, không cần chạy bước 2 nữa
          } catch (err) {
            // Nếu tự động làm mới thất bại (Refresh token hết hạn / không hợp lệ),
            // Axios response interceptor đã tự động xóa token và redirect.
            console.error("Làm mới token thất bại:", err);
            return;
          }
        }

        // 2. Định kỳ kiểm tra tính hợp lệ với server (kể cả khi token chưa hết hạn client-side)
        try {
          await api.get('/me');
        } catch (err) {
          console.error("Lỗi xác thực định kỳ:", err);
        }
      }
    };

    // Chạy kiểm tra ngay khi mở trang
    checkTokenExpiryAndValidity();

    // Lắng nghe sự kiện focus tab và visibilitychange
    const handleFocus = () => {
      checkTokenExpiryAndValidity();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkTokenExpiryAndValidity();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Gọi API /logout ở Backend để xoá HttpOnly Cookie
      await api.post('/logout');
    } catch (err) {
      console.error("Lỗi khi gọi logout ở backend:", err);
    }
    
    // Xoá toàn bộ thông tin đăng nhập ở client-side
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername(null);
    setCurrentUser(null);
    toast.success("Đăng xuất thành công!");
    window.location.href = "/login";
  };

  const handleLoginSuccess = () => {
    setTimeout(() => {
      toast.success("Đăng nhập thành công!");
      window.location.href = "/tong-quan";
    }, 2000);
  };

  const isAdmin = Boolean(currentUser?.is_admin);
  const renderAdminRoute = (page) => token
    ? (authLoading
      ? <div className="min-h-screen flex items-center justify-center text-judicial-navy font-semibold">Đang kiểm tra quyền truy cập...</div>
      : (isAdmin
        ? page
        : <Navigate to="/tong-quan" replace />))
    : <Navigate to="/login" replace />;

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* Trang mặc định → nếu đã đăng nhập thì vào tổng quan, chưa thì login */}
        <Route path="/" element={token ? <Navigate to="/tong-quan" /> : <Login onLoginSuccess={handleLoginSuccess} />} />

        {/* Trang đăng nhập */}
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />

        {/* Trang tổng quan của hệ thống */}
        <Route
          path="/tong-quan"
          element={token ? <JudgeOverview judgeName={username} onLogout={handleLogout} isAdmin={isAdmin} /> : <Navigate to="/login" />}
        />

        {/* Trang lịch dạng vạn niên của thẩm phán */}
        <Route
          path="/lich-tham-phan"
          element={token ? <JudgeCalendar judgeName={username} onLogout={handleLogout} isAdmin={isAdmin} /> : <Navigate to="/login" />}
        />

        {/* Trang thống kê phiên xử của các thẩm phán */}
        <Route
          path="/thong-ke-phien-xu"
          element={token ? <JudgeStats judgeName={username} onLogout={handleLogout} isAdmin={isAdmin} /> : <Navigate to="/login" />}
        />

        {/* Trang quản lý danh sách phiên tòa trong tháng */}
        <Route
          path="/quan-ly-phien-toa"
          element={token ? <JudgeManagement judgeName={username} onLogout={handleLogout} isAdmin={isAdmin} /> : <Navigate to="/login" />}
        />

        <Route
          path="/quan-ly-nguoi-dung"
          element={renderAdminRoute(<UserManagement judgeName={username} onLogout={handleLogout} currentUser={currentUser} />)}
        />
        <Route
          path="/quan-ly-hoi-dong-xet-xu"
          element={renderAdminRoute(<CouncilManagement judgeName={username} onLogout={handleLogout} />)}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App

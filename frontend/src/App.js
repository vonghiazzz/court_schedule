import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from './pages/Login'
import Schedule from './pages/Schedule'
import JudgeCalendar from './pages/JudgeCalendar'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
const [username, setUsername] = useState(() => localStorage.getItem("username") || "Khong xác định");

  // Cập nhật lại token nếu localStorage thay đổi (ví dụ sau khi đăng nhập)
  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem('token'));
      setUsername(localStorage.getItem("username"));
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

   const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername(null);
    toast.success("Đăng xuất thành công!");          
    window.location.href = "/login"; // hoặc Navigate
  };
  const handleLoginSuccess = () => {
    setTimeout(() => {
      toast.success("Đăng nhập thành công!");          
      window.location.href = "/lich-tham-phan"; // hoặc Navigate    
    }, 2000); 
};

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>        
        {/* Trang mặc định → nếu đã đăng nhập thì vào schedule, chưa thì login */}
        <Route path="/" element={token ? <Navigate to="/lich-tham-phan" /> : <Login onLoginSuccess={handleLoginSuccess} />} />
    
        {/* Trang đăng nhập */}
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />

        {/* Trang chính: lịch xét xử */}
        <Route path="/schedule" element={<Schedule />} />

        {/* Trang lịch dạng vạn niên của thẩm phán */}
         <Route
          path="/lich-tham-phan"
          element={<JudgeCalendar judgeName={username} onLogout={handleLogout} />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App

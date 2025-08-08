import { useState } from 'react'
import axios from '../utils/axios'
import { toast } from "react-toastify";

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const params = new URLSearchParams()
      params.append('username', username)
      params.append('password', password)

      const res = await axios.post('/login', params)

      if (res.data?.access_token) {
        localStorage.setItem('token', res.data.access_token)
        localStorage.setItem('username', username)                
        sessionStorage.setItem('justLoggedIn', 'true'); // 👈 set flag
        window.dispatchEvent(new Event('storage'))
        if (onLoginSuccess) onLoginSuccess()
      } else {
        toast.warning("Đăng nhập thất bại! Token không hợp lệ.")
      }
    } catch (err) {
      toast.warning("❌ Đăng nhập thất bại! Vui lòng kiểm tra tài khoản và mật khẩu.")
      console.error("Login error:", err)
    }
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title mb-4 text-center">Trang Đăng Nhập</h3>
               <div className="text-center mt-4">
                <img
                  src="/images/logoToaAn.jpg"
                  alt="Logo Tòa Án"
                  className="img-fluid"
                  style={{ maxHeight: '200px' }}
                />
              </div>
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label">Tài khoản</label>
                  <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mật khẩu</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <button type="submit" className="btn btn-primary w-100">
                  Đăng nhập
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}
export default Login

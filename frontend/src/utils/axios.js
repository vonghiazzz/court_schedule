// src/axios.js
import axios from 'axios'

// Tạo một instance axios
const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Base URL của FastAPI
  // baseURL: 'http://localhost:8001', // Base URL của FastAPI
  // baseURL: process.env.REACT_APP_API_URL, // On vercel

  // baseURL: 'https://talented-liberation-production.up.railway.app/',
  headers: {
    'Content-Type': 'application/json',
    // các header khác như Authorization nếu có
  },

})

// 👉 Interceptor cho REQUEST: Tự động gắn token
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 👉 Interceptor cho RESPONSE: Nếu token sai hoặc hết hạn thì logout
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/' 
    }
    return Promise.reject(error)
  }
)

export default instance

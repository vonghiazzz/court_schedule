// src/axios.js
import axios from 'axios'

// Tạo một instance axios
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// 👉 Interceptor cho REQUEST: Tự động gắn token
instance.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
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
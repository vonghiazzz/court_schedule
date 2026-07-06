// src/utils/axios.js
import axios from 'axios'

// Tạo một instance axios
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  withCredentials: true, // 🟢 Bắt buộc để trình duyệt tự động gửi Cookie kèm request
  headers: {
    'Content-Type': 'application/json',
  },
})

// Helper functions for JWT expiration checking
export function getJwtExpiry(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload).exp * 1000;
  } catch (e) {
    return null;
  }
}

export function isTokenExpired(token) {
  const expiry = getJwtExpiry(token);
  if (!expiry) return true;
  return Date.now() >= expiry;
}

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

// Variables to handle refreshing status and queued requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 👉 Interceptor cho RESPONSE: Xử lý hết hạn bằng Refresh Token từ HttpOnly Cookie, nếu thất bại thì logout
instance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Check if the response was unauthorized, not retried yet, and not a login request
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes('/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return instance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API /refresh mà KHÔNG cần gửi body vì refresh_token nằm trong HttpOnly Cookie
        const res = await axios.post(
          (process.env.REACT_APP_API_URL || '/api') + '/refresh',
          {},
          { withCredentials: true }
        );
        const { access_token } = res.data;

        localStorage.setItem('token', access_token);
        // Dispatch event để đồng bộ React state trong cùng tab (App.js)
        window.dispatchEvent(new Event('storage'));

        processQueue(null, access_token);
        isRefreshing = false;

        originalRequest.headers['Authorization'] = 'Bearer ' + access_token;
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear auth data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
)

export default instance
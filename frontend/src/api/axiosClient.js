import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Need this if using cookies in the future, but backend uses Bearer token for now
});

// Request Interceptor: Đính kèm token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý lỗi & Tự động Refresh Token (nếu backend có cơ chế trả về lỗi hết hạn)
axiosClient.interceptors.response.use(
  (response) => {
    return response.data; // Backend hiện tại bọc data trong `data` của object trả về (status, message, data)
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 (Hết hạn token hoặc không hợp lệ) và chưa bị retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Trong postman user đã viết Pre-request script để gọi refresh token.
      // Dưới UI cũng làm tương tự. Nhưng backend cần route POST /api/auth/refresh-token
      try {
        const res = await axios.post('http://localhost:3000/api/auth/refresh-token', {}, {
          withCredentials: true // giả sử refresh token lưu trong HttpOnly Cookie theo chuẩn
        });
        
        if (res.data?.data?.accessToken) {
          localStorage.setItem('accessToken', res.data.data.accessToken);
          axiosClient.defaults.headers.common['Authorization'] = `Bearer ${res.data.data.accessToken}`;
          return axiosClient(originalRequest);
        }
      } catch (err) {
        // Refresh token failed -> Force logout
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;

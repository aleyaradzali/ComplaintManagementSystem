import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(
      error.response?.data ?? { success: false, message: 'Network error', data: null }
    );
  }
);

export default axiosClient;

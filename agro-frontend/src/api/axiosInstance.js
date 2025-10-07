// /src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    Accept: 'application/json',
  },
});


axiosInstance.interceptors.request.use(
  (config) => {
 
    let token = sessionStorage.getItem('token');


    if (!token) {
      token = localStorage.getItem('token');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;

import axios from 'axios';

const URL = import.meta.env.VITE_API_BASE_URL || 'https://cityfix-backend.onrender.com';

const instance = axios.create({
    baseURL: URL,
});

// Add request interceptor to attach token
instance.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const { token } = JSON.parse(userInfo);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default instance;

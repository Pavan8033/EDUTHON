import axios from 'axios';

const URL = import.meta.env.VITE_API_BASE_URL || 'https://cityfix-backend.onrender.com';

const instance = axios.create({
    baseURL: URL,
});

export default instance;

import axios from 'axios';

// Create an instance for easy configuration
const URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const instance = axios.create({
    baseURL: URL,
});

export default instance;

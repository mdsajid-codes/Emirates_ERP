import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error("No authentication token found.");
    }
    return { "Authorization": `Bearer ${token}` };
};

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(config => {
    try {
        config.headers = {
            ...config.headers,
            ...getAuthHeaders(),
        };
    } catch (error) {
        console.error(error.message);
    }
    return config;
});

export default api;

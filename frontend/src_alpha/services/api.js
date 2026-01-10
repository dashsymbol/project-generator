import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api';

const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add Token to requests if available
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

export const api = {
    // Auth
    login: (username, password) => client.post('/auth/login/', { username, password }),
    signup: (data) => client.post('/auth/signup/', data),
    getMe: () => client.get('/auth/me/'),

    // App
    checkHealth: () => client.get('/health'),
    getQuestionnaire: () => client.get('/config/questionnaire'),
    getProjects: () => client.get('/projects/'),
    getProject: (id) => client.get(`/projects/${id}/`),
    generateProject: (category, answers) => client.post('/projects/generate/', { category, answers }),
};

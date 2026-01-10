import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api';

const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add Token and Language to requests
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const language = localStorage.getItem('app_language') || 'en';

    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }

    config.headers['Accept-Language'] = language;
    return config;
});

export const api = {
    // Auth
    login: (username, password) => client.post('/auth/login/', { username, password }),
    signup: (data) => client.post('/auth/signup/', data),
    getMe: () => client.get('/auth/me/'),

    // Skills
    getSkillProfile: () => client.get('/skills/me/'),
    createSkillProfile: (data) => client.post('/skills/', data),
    updateSkillProfile: (id, data) => client.put(`/skills/${id}/`, data),
    generateSkillProfile: (userInput) => client.post('/skills/generate/', { user_input: userInput }),

    // App
    checkHealth: () => client.get('/health'),
    getQuestionnaire: () => client.get('/config/questionnaire'),
    getProjects: () => client.get('/projects/'),
    getProject: (id) => client.get(`/projects/${id}/`),
    generateProject: (category, answers, difficulty, focus_area) => client.post('/projects/generate/', { category, answers, difficulty, focus_area }),
};

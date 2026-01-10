import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api';

const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const api = {
    checkHealth: () => client.get('/health'),
    getQuestionnaire: () => client.get('/config/questionnaire'),
    getProjects: () => client.get('/projects/'),
    getProject: (id) => client.get(`/projects/${id}/`),
    generateProject: (category, answers) => client.post('/projects/generate/', { category, answers }),
};

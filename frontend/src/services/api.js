import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// ప్రతి రిక్వెస్ట్ కి Token పంపడానికి (Login అయ్యాక)
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;
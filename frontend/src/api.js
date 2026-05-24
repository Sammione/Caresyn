import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
});

export const getPatients = () => api.get('/patients/');
export const createPatient = (data) => api.post('/patients/', data);
export const getTasks = () => api.get('/tasks/');
export const analyzePatient = (data) => api.post('/agent/analyze', data);

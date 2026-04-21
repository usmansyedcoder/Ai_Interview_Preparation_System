import axios from 'axios';

// Use relative path for proxy to work
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Resume API
export const uploadResume = async (file, jobTitle, jobDescription) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('job_title', jobTitle);
  if (jobDescription) formData.append('job_description', jobDescription);
  
  const response = await api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export default api;
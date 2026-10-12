import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginApi = (data) => API.post('/auth/login', data);
export const registerApi = (data) => API.post('/auth/register', data);
export const changePasswordApi = (data) => API.post('/auth/change-password', data);

export const getOwnerKpi = () => API.get('/owner/dashboard-kpi');
export const addTrainerApi = (data) => API.post('/owner/add-trainer', data);
export const addMemberApi = (data) => API.post('/owner/add-member', data);
export const getCompetitionPosters = () => API.get('/owner/posters');
export const createPosterApi = (formData) => API.post('/owner/add-poster', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const getTrainerDashboardApi = () => API.get('/trainer/dashboard');
export const trainerAddMemberApi = (data) => API.post('/trainer/add-member', data);
export const createWorkoutApi = (data) => API.post('/trainer/create-workout', data);

export const getMemberDashboardApi = () => API.get('/member/dashboard');
export const markAttendanceApi = () => API.post('/member/mark-attendance');
export const submitFeedbackApi = (data) => API.post('/member/submit-feedback', data);
export const sendMessageApi = (data) => API.post('/member/send-message', data);
export const getMessagesApi = (otherUserId) => API.get(`/member/messages/${otherUserId}`);

export const getSuperAdminDashboardApi = () => API.get('/super-admin/dashboard');
export const getRevenueAnalyticsApi = () => API.get('/owner/analytics/revenue');

export default API;
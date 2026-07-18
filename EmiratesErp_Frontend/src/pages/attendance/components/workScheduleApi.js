import api from './api';

export const getAllWorkSchedules = () => api.get('/work-schedules');
export const getWorkScheduleById = (id) => api.get(`/work-schedules/${id}`);
export const createWorkSchedule = (data) => api.post('/work-schedules', data);
export const updateWorkSchedule = (id, data) => api.put(`/work-schedules/${id}`, data);
export const deleteWorkSchedule = (id) => api.delete(`/work-schedules/${id}`);

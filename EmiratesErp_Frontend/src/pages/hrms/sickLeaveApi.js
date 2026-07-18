import api from './api';

export const getAllSickLeaveTypes = () => api.get('/sick-leave-types');
export const getSickLeaveTypeById = (id) => api.get(`/sick-leave-types/${id}`);
export const createSickLeaveType = (data) => api.post('/sick-leave-types', data);
export const updateSickLeaveType = (id, data) => api.put(`/sick-leave-types/${id}`, data);
export const deleteSickLeaveType = (id) => api.delete(`/sick-leave-types/${id}`);

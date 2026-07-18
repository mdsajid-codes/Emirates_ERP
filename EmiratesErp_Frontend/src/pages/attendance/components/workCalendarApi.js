import api from './api';

export const getAllHolidayPolicies = () => api.get('/holiday-policies');
export const createHolidayPolicy = (data) => api.post('/holiday-policies', data);
export const updateHolidayPolicy = (id, data) => api.put(`/holiday-policies/${id}`, data);
export const deleteHolidayPolicy = (id) => api.delete(`/holiday-policies/${id}`);

// Exceptions
export const getExceptionsByPolicy = (policyId) => api.get(`/work-calendar-exceptions?policyId=${policyId}`);
export const createException = (data) => api.post('/work-calendar-exceptions', data);
export const updateException = (id, data) => api.put(`/work-calendar-exceptions/${id}`, data);
export const deleteException = (id) => api.delete(`/work-calendar-exceptions/${id}`);

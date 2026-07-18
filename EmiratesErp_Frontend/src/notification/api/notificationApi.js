import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error("No authentication token found.");
    }
    return { "Authorization": `Bearer ${token}` };
};

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(config => {
    try {
        config.headers = {
            ...config.headers,
            ...getAuthHeaders(),
        };
    } catch (error) {
        console.error(error.message);
    }
    return config;
});

// --- Email Endpoints ---
export const getEmailConfig = () => api.get('/notification/email/config');
export const saveEmailConfig = (data) => api.put('/notification/email/config', data);
export const testEmailConnection = (data) => api.post('/notification/email/test-connection', data);
export const getEmailLogs = (page = 0, size = 10) => api.get(`/notification/email/logs?page=${page}&size=${size}`);

export const getEmailTemplates = () => api.get('/notification/templates/email');
export const createEmailTemplate = (data) => api.post('/notification/templates/email', data);
export const updateEmailTemplate = (id, data) => api.put(`/notification/templates/email/${id}`, data);
export const deleteEmailTemplate = (id) => api.delete(`/notification/templates/email/${id}`);
export const testEmailTemplate = (data) => api.post('/notification/templates/email/test', data);

// --- SMS Endpoints ---
export const getSmsConfig = () => api.get('/notification/sms/config');
export const saveSmsConfig = (data) => api.put('/notification/sms/config', data);
export const getSmsLogs = (page = 0, size = 10) => api.get(`/notification/sms/logs?page=${page}&size=${size}`);

export const getSmsTemplates = () => api.get('/notification/templates/sms');
export const createSmsTemplate = (data) => api.post('/notification/templates/sms', data);
export const updateSmsTemplate = (id, data) => api.put(`/notification/templates/sms/${id}`, data);
export const deleteSmsTemplate = (id) => api.delete(`/notification/templates/sms/${id}`);

// --- WhatsApp Endpoints ---
export const getWhatsAppConfig = () => api.get('/notification/whatsapp/config');
export const saveWhatsAppConfig = (data) => api.put('/notification/whatsapp/config', data);
export const testWhatsAppConnection = (recipient, templateId = 'test_hello') => 
    api.post(`/notification/whatsapp/test?recipient=${recipient}&templateId=${templateId}`);
export const getWhatsAppLogs = (page = 0, size = 10) => api.get(`/notification/whatsapp/logs?page=${page}&size=${size}`);

export const getWhatsAppTemplates = () => api.get('/notification/templates/whatsapp');
export const createWhatsAppTemplate = (data) => api.post('/notification/templates/whatsapp', data);
export const updateWhatsAppTemplate = (id, data) => api.put(`/notification/templates/whatsapp/${id}`, data);
export const deleteWhatsAppTemplate = (id) => api.delete(`/notification/templates/whatsapp/${id}`);

// --- Telegram Endpoints ---
export const getTelegramConfig = () => api.get('/notification/telegram/config');
export const saveTelegramConfig = (data) => api.put('/notification/telegram/config', data);
export const getTelegramLogs = (page = 0, size = 10) => api.get(`/notification/telegram/logs?page=${page}&size=${size}`);

// --- Webhook Endpoints ---
export const getWebhooks = () => api.get('/notification/webhooks');
export const createWebhook = (data) => api.post('/notification/webhooks', data);
export const updateWebhook = (id, data) => api.put(`/notification/webhooks/${id}`, data);
export const deleteWebhook = (id) => api.delete(`/notification/webhooks/${id}`);

// --- Lead Integration Endpoints ---
export const getLeadApiKey = () => api.get('/notification/lead-integration/api-key');
export const regenerateLeadApiKey = () => api.post('/notification/lead-integration/api-key/regenerate');

// --- In-App Notification Endpoints ---
export const getInAppMessages = (page = 0, size = 10) => api.get(`/notification/inapp/messages?page=${page}&size=${size}`);
export const markInAppAsRead = (id) => api.put(`/notification/inapp/messages/${id}/read`);

// --- Dashboard Stats ---
export const getNotificationDashboardStats = () => api.get('/notification/dashboard/stats');

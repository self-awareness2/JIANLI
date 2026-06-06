import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Resumes
export const resumeAPI = {
  list: () => api.get('/resumes'),
  get: (id) => api.get(`/resumes/${id}`),
  create: (data) => api.post('/resumes', data),
  update: (id, data) => api.put(`/resumes/${id}`, data),
  delete: (id) => api.delete(`/resumes/${id}`),
  duplicate: (id) => api.post(`/resumes/${id}/duplicate`),
};

// Sections
export const sectionAPI = {
  update: (id, data) => api.put(`/sections/${id}`, data),
  create: (data) => api.post('/sections', data),
  delete: (id) => api.delete(`/sections/${id}`),
  reorder: (resumeId, orders) => api.put(`/sections/reorder/${resumeId}`, { orders }),
};

// Export
export const exportAPI = {
  checkExport: (resumeId) => api.get(`/export/check/${resumeId}`),
  exportPDF: (resumeId) => api.post(`/export/${resumeId}/pdf`),
  // 使用单次导出令牌导出PDF
  exportPDFWithToken: (resumeId, exportToken) =>
    api.post(`/export/${resumeId}/pdf`, { exportToken }),
};

// Payments
export const paymentAPI = {
  getStatus: () => api.get('/payments/status'),
  createOrder: (amount) => api.post('/payments/create', { amount }),
  confirmPayment: (paymentId) => api.post(`/payments/confirm/${paymentId}`),
  // 单次导出支付
  confirmExportPayment: (orderId) => api.post(`/payments/confirm-export/${orderId}`),
  createExportOrder: (resumeId) => api.post('/payments/create-export-order', { resumeId }),
  checkOrderStatus: (orderId) => api.get(`/payments/order-status/${orderId}`),
  verifyExportToken: (token, resumeId) =>
    api.post('/payments/verify-export-token', { token, resumeId }),
};

// Import
export const importAPI = {
  import: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  preview: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Gallery
export const galleryAPI = {
  list: (category) => api.get('/gallery', { params: { category } }),
  get: (id) => api.get(`/gallery/${id}`),
  use: (id) => api.post(`/gallery/${id}/use`),
};

// AI
export const aiAPI = {
  getQuota: () => api.get('/ai/quota'),
  enhanceDescription: (description, context) =>
    api.post('/ai/enhance-description', { description, context }),
  generateSummary: (data) =>
    api.post('/ai/generate-summary', data),
  chat: (message, { messages, context } = {}) =>
    api.post('/ai/chat', { message, messages, context }),
  chatStream: async (message, { messages, context } = {}, onChunk, onDone, onError) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${api.defaults.baseURL}/ai/chat-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, messages, context }),
    });
    // Check if it's a non-streaming fallback or error (JSON)
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (data.error) { onError?.(data.error); return null; }
      onChunk?.(data.reply || '');
      onDone?.({ quota: data.quota });
      return null;
    }
    // SSE stream
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let quotaInfo = null;
    const abortController = { aborted: false };
    const process = async () => {
      while (true) {
        if (abortController.aborted) { reader.cancel(); break; }
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === '[DONE]') { onDone?.(quotaInfo); return abortController; }
          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) { onError?.(parsed.error); return abortController; }
            if (parsed.quota !== undefined) { quotaInfo = { quota: parsed.quota, quotaUsed: parsed.quotaUsed }; }
            if (parsed.content) { onChunk?.(parsed.content); }
          } catch {}
        }
      }
      onDone?.(quotaInfo);
    };
    process();
    return abortController;
  },
};

export default api;

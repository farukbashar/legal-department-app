const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('legal_app_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }

  return data;
}

export const api = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  listContracts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/contracts${qs ? `?${qs}` : ''}`);
  },
  getContract: (id) => request(`/contracts/${id}`),
  createContract: (data) => request('/contracts', { method: 'POST', body: JSON.stringify(data) }),
  updateContract: (id, data) => request(`/contracts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteContract: (id) => request(`/contracts/${id}`, { method: 'DELETE' }),

  startApprovals: (id) => request(`/contracts/${id}/approvals/start`, { method: 'POST' }),
  listApprovals: (id) => request(`/contracts/${id}/approvals`),
  decideApproval: (approvalId, decision, comments) =>
    request(`/contracts/approvals/${approvalId}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision, comments }),
    }),

  requestSignature: (id, signer) =>
    request(`/contracts/${id}/signatures`, { method: 'POST', body: JSON.stringify(signer) }),
  listSignatures: (id) => request(`/contracts/${id}/signatures`),
  recordSignature: (signatureId, status) =>
    request(`/contracts/signatures/${signatureId}/record`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  uploadVersion: (id, doc) =>
    request(`/contracts/${id}/versions`, { method: 'POST', body: JSON.stringify(doc) }),
  listVersions: (id) => request(`/contracts/${id}/versions`),

  // Legal Opinion Management
  createOpinionRequest: (data) => request('/legal-opinions/requests', { method: 'POST', body: JSON.stringify(data) }),
  listOpinionRequests: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/legal-opinions/requests${qs ? `?${qs}` : ''}`);
  },
  getOpinionRequest: (id) => request(`/legal-opinions/requests/${id}`),
  assignOfficer: (id, officerId) =>
    request(`/legal-opinions/requests/${id}/assign`, { method: 'POST', body: JSON.stringify({ officerId }) }),
  startDraft: (requestId) => request(`/legal-opinions/requests/${requestId}/draft/start`, { method: 'POST' }),
  getOpinion: (id) => request(`/legal-opinions/opinions/${id}`),
  updateDraft: (opinionId, content) =>
    request(`/legal-opinions/opinions/${opinionId}/draft`, { method: 'PUT', body: JSON.stringify({ content }) }),
  submitForReview: (opinionId) => request(`/legal-opinions/opinions/${opinionId}/submit-for-review`, { method: 'POST' }),
  decideReview: (opinionId, decision, comments) =>
    request(`/legal-opinions/opinions/${opinionId}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, comments }),
    }),
  searchOpinions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/legal-opinions/opinions/search${qs ? `?${qs}` : ''}`);
  },

  // Litigation Management
  listCases: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/litigation/cases${qs ? `?${qs}` : ''}`);
  },
  getCase: (id) => request(`/litigation/cases/${id}`),
  createCase: (data) => request('/litigation/cases', { method: 'POST', body: JSON.stringify(data) }),
  updateCase: (id, data) => request(`/litigation/cases/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCase: (id) => request(`/litigation/cases/${id}`, { method: 'DELETE' }),

  scheduleHearing: (caseId, data) => request(`/litigation/cases/${caseId}/hearings`, { method: 'POST', body: JSON.stringify(data) }),
  listHearings: (caseId) => request(`/litigation/cases/${caseId}/hearings`),
  recordHearingOutcome: (hearingId, outcome) =>
    request(`/litigation/hearings/${hearingId}/outcome`, { method: 'PUT', body: JSON.stringify({ outcome }) }),

  assignCounsel: (caseId, data) => request(`/litigation/cases/${caseId}/counsel`, { method: 'POST', body: JSON.stringify(data) }),
  listCounsel: (caseId) => request(`/litigation/cases/${caseId}/counsel`),
  removeCounsel: (counselId) => request(`/litigation/counsel/${counselId}`, { method: 'DELETE' }),

  recordJudgment: (caseId, data) => request(`/litigation/cases/${caseId}/judgment`, { method: 'POST', body: JSON.stringify(data) }),
  getJudgment: (caseId) => request(`/litigation/cases/${caseId}/judgment`),

  // MoU Management
  listMous: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/mous${qs ? `?${qs}` : ''}`);
  },
  getMou: (id) => request(`/mous/${id}`),
  createMou: (data) => request('/mous', { method: 'POST', body: JSON.stringify(data) }),
  updateMouDraft: (id, data) => request(`/mous/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMou: (id) => request(`/mous/${id}`, { method: 'DELETE' }),
  submitMouForReview: (id) => request(`/mous/${id}/submit-for-review`, { method: 'POST' }),
  startMouApprovals: (id) => request(`/mous/${id}/approvals/start`, { method: 'POST' }),
  listMouApprovals: (id) => request(`/mous/${id}/approvals`),
  decideMouApproval: (approvalId, decision, comments) =>
    request(`/mous/approvals/${approvalId}/decide`, { method: 'POST', body: JSON.stringify({ decision, comments }) }),
  renewMou: (id, newRenewalDate) => request(`/mous/${id}/renew`, { method: 'POST', body: JSON.stringify({ newRenewalDate }) }),
  listMouReminders: (id) => request(`/mous/${id}/reminders`),

  // Board Resolution Archive
  listResolutions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/board-resolutions${qs ? `?${qs}` : ''}`);
  },
  getResolution: (id) => request(`/board-resolutions/${id}`),
  createResolution: (data) => request('/board-resolutions', { method: 'POST', body: JSON.stringify(data) }),
  updateResolution: (id, data) => request(`/board-resolutions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteResolution: (id) => request(`/board-resolutions/${id}`, { method: 'DELETE' }),
  linkResolutionDocument: (id, doc) => request(`/board-resolutions/${id}/documents`, { method: 'POST', body: JSON.stringify(doc) }),
  listResolutionDocuments: (id) => request(`/board-resolutions/${id}/documents`),

  // Compliance Tracker
  listObligations: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/compliance${qs ? `?${qs}` : ''}`);
  },
  getObligation: (id) => request(`/compliance/${id}`),
  createObligation: (data) => request('/compliance', { method: 'POST', body: JSON.stringify(data) }),
  updateObligation: (id, data) => request(`/compliance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteObligation: (id) => request(`/compliance/${id}`, { method: 'DELETE' }),

  // Recovery & Debt Cases
  listDebtCases: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/recovery/cases${qs ? `?${qs}` : ''}`);
  },
  getDebtCase: (id) => request(`/recovery/cases/${id}`),
  createDebtCase: (data) => request('/recovery/cases', { method: 'POST', body: JSON.stringify(data) }),
  updateDebtCase: (id, data) => request(`/recovery/cases/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDebtCase: (id) => request(`/recovery/cases/${id}`, { method: 'DELETE' }),
  recordDebtPayment: (id, data) => request(`/recovery/cases/${id}/payments`, { method: 'POST', body: JSON.stringify(data) }),
  listDebtPayments: (id) => request(`/recovery/cases/${id}/payments`),

  // Legal Knowledge Base
  listKnowledgeItems: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/knowledge-base${qs ? `?${qs}` : ''}`);
  },
  getKnowledgeItem: (id) => request(`/knowledge-base/${id}`),
  createKnowledgeItem: (data) => request('/knowledge-base', { method: 'POST', body: JSON.stringify(data) }),
  updateKnowledgeItem: (id, data) => request(`/knowledge-base/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteKnowledgeItem: (id) => request(`/knowledge-base/${id}`, { method: 'DELETE' }),

  // Executive Dashboard
  getDashboardSummary: () => request('/dashboard/summary'),

  // Users (admin only)
  listUsers: () => request('/auth/users'),
  registerUser: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/auth/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Password management
  changePassword: (currentPassword, newPassword) =>
    request('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),
  adminResetPassword: (userId, newPassword) =>
    request(`/auth/users/${userId}/reset-password`, { method: 'POST', body: JSON.stringify({ newPassword }) }),

  // Reminders
  listReminders: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/reminders${qs ? `?${qs}` : ''}`);
  },
  markReminderSent: (id) => request(`/reminders/${id}/mark-sent`, { method: 'PUT' }),

  // File uploads — multipart, so this bypasses the JSON `request` helper
  uploadFile: async (file) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/uploads`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || `Upload failed (${res.status})`);
    return data;
  },

  // Global search
  globalSearch: (q) => request(`/search?q=${encodeURIComponent(q)}`),

  // Audit log (admin only)
  listAuditLog: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/audit-log${qs ? `?${qs}` : ''}`);
  },
};

export function saveSession(token, user) {
  localStorage.setItem('legal_app_token', token);
  localStorage.setItem('legal_app_user', JSON.stringify(user));
}

export function getCurrentUser() {
  const raw = localStorage.getItem('legal_app_user');
  return raw ? JSON.parse(raw) : null;
}

export function saveToken(token) {
  localStorage.setItem('legal_app_token', token);
}

export function clearToken() {
  localStorage.removeItem('legal_app_token');
  localStorage.removeItem('legal_app_user');
}

export function hasToken() {
  return Boolean(getToken());
}

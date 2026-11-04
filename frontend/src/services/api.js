import { localStore } from './localStore';

const API_BASE = '/api';

const isCloudHosted = typeof window !== 'undefined' && 
  (window.location.hostname.includes('web.app') || 
   window.location.hostname.includes('firebaseapp.com') ||
   window.location.hostname.includes('github.io'));

function getHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };

  const token = localStorage.getItem('wk_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-admin-token'] = token;
  }

  const adminPin = localStorage.getItem('wk_pin');
  if (adminPin) {
    headers['x-admin-pin'] = adminPin;
  }

  return headers;
}

// Safely execute API call with transparent fallback to localStore
async function safeApiCall(apiFn, fallbackFn) {
  if (isCloudHosted) {
    if (fallbackFn) return fallbackFn();
  }
  try {
    return await apiFn();
  } catch (err) {
    // If backend is unreachable or 404 (e.g. on Firebase Hosting static), run in local fallback
    if (fallbackFn) {
      return fallbackFn();
    }
    throw err;
  }
}

export const api = {
  // Auth
  async login({ username, password, pin }) {
    return safeApiCall(
      async () => {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, pin })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to login');
        if (data.token) localStorage.setItem('wk_token', data.token);
        return data;
      },
      () => localStore.login({ username, password, pin })
    );
  },

  async getMe() {
    return safeApiCall(
      async () => {
        const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Auth me error');
        return res.json();
      },
      () => localStore.getMe()
    );
  },

  async logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', headers: getHeaders() });
    } catch (e) {}
    localStorage.removeItem('wk_token');
    localStorage.removeItem('wk_pin');
    localStorage.removeItem('wk_user');
    localStorage.setItem('wk_role', 'management');
    return localStore.logout();
  },

  async verifyPin(pin) {
    return safeApiCall(
      async () => {
        const res = await fetch(`${API_BASE}/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin })
        });
        return res.json();
      },
      () => {
        const valid = pin === '1234';
        return { valid, message: valid ? 'PIN Verified' : 'Invalid PIN' };
      }
    );
  },

  // Users Management (Admin)
  async getUsers() {
    return safeApiCall(
      async () => {
        const res = await fetch(`${API_BASE}/users`, { headers: getHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
        return data;
      },
      () => localStore.getUsers()
    );
  },

  async createUser(userData) {
    return safeApiCall(
      async () => {
        const res = await fetch(`${API_BASE}/users`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(userData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create user');
        return data;
      },
      () => localStore.createUser(userData)
    );
  },

  async updateUser(id, userData) {
    return safeApiCall(
      async () => {
        const res = await fetch(`${API_BASE}/users/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(userData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update user');
        return data;
      },
      () => localStore.updateUser(id, userData)
    );
  },

  async deleteUser(id) {
    return safeApiCall(
      async () => {
        const res = await fetch(`${API_BASE}/users/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete user');
        return data;
      },
      () => localStore.deleteUser(id)
    );
  },

  // Project Settings
  async getProject() {
    return safeApiCall(
      async () => {
        const res = await fetch(`${API_BASE}/project`);
        if (!res.ok) throw new Error('Failed to fetch project info');
        return res.json();
      },
      () => localStore.getProject()
    );
  },

  async updateProject(data) {
    return safeApiCall(
      async () => {
        const res = await fetch(`${API_BASE}/project`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(data)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to update project settings');
        return result;
      },
      () => localStore.updateProject(data)
    );
  },

  // Categories
  async getCategories() {
    return safeApiCall(
      async () => {
        const res = await fetch(`${API_BASE}/categories`);
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
      },
      () => localStore.getCategories()
    );
  },

  async createCategory(catData) {
    return safeApiCall(
      async () => {
        const res = await fetch(`${API_BASE}/categories`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(catData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create category');
        return data;
      },
      () => localStore.createCategory(catData)
    );
  },

  async updateCategory(id, catData) {
    return safeApiCall(
      async () => {
        const res = await fetch(`${API_BASE}/categories/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(catData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update category');
        return data;
      },
      () => localStore.updateCategory(id, catData)
    );
  },

  async deleteCategory(id) {
    return safeApiCall(
      async () => {
        const res = await fetch(`${API_BASE}/categories/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete category');
        return data;
      },
      () => localStore.deleteCategory(id)
    );
  },

  // Tasks
  async getTasks(params = {}) {
    return safeApiCall(
      async () => {
        const query = new URLSearchParams();
        if (params.search) query.set('search', params.search);
        if (params.category && params.category !== 'all') query.set('category', params.category);
        if (params.assignee && params.assignee !== 'all') query.set('assignee', params.assignee);
        if (params.status && params.status !== 'all') query.set('status', params.status);
        if (params.deadline && params.deadline !== 'all') query.set('deadline', params.deadline);

        const res = await fetch(`${API_BASE}/tasks?${query.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch tasks');
        return res.json();
      },
      () => localStore.getTasks(params)
    );
  },

  async createTask(data) {
    return safeApiCall(
      async () => {
        const res = await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to create task');
        return result;
      },
      () => localStore.createTask(data)
    );
  },

  async updateTask(id, data) {
    return safeApiCall(
      async () => {
        const res = await fetch(`${API_BASE}/tasks/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(data)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to update task');
        return result;
      },
      () => localStore.updateTask(id, data)
    );
  },

  async updateTaskStatus(id, status) {
    return safeApiCall(
      async () => {
        const res = await fetch(`${API_BASE}/tasks/${id}/status`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({ status })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to update task status');
        return result;
      },
      () => localStore.updateTaskStatus(id, status)
    );
  },

  async deleteTask(id) {
    return safeApiCall(
      async () => {
        const res = await fetch(`${API_BASE}/tasks/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to delete task');
        return result;
      },
      () => localStore.deleteTask(id)
    );
  },

  // Metrics
  async getMetrics() {
    return safeApiCall(
      async () => {
        const res = await fetch(`${API_BASE}/metrics`);
        if (!res.ok) throw new Error('Failed to fetch metrics');
        return res.json();
      },
      () => localStore.getMetrics()
    );
  },

  // Reset
  async resetDefaults() {
    return safeApiCall(
      async () => {
        const res = await fetch(`${API_BASE}/reset`, {
          method: 'POST',
          headers: getHeaders()
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to reset demo data');
        return result;
      },
      () => localStore.resetToDefault()
    );
  },

  // Backup
  async exportJSON() {
    return safeApiCall(
      async () => {
        const res = await fetch(`${API_BASE}/backup/export`);
        if (!res.ok) throw new Error('Failed to export backup');
        return res.json();
      },
      () => localStore.exportBackup()
    );
  },

  async importJSON(jsonData) {
    return safeApiCall(
      async () => {
        const res = await fetch(`${API_BASE}/backup/import`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(jsonData)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to import backup');
        return result;
      },
      () => localStore.restoreBackup(jsonData)
    );
  },

  getCSVUrl(lang = 'ar') {
    return `${API_BASE}/export/csv?lang=${lang}`;
  }
};

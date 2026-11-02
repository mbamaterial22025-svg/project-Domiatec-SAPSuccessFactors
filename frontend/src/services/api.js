const API_BASE = '/api';

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

export const api = {
  // Auth
  async login({ username, password, pin }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, pin })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to login');
    if (data.token) {
      localStorage.setItem('wk_token', data.token);
    }
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getHeaders()
      });
    } catch (e) {}
    localStorage.removeItem('wk_token');
  },

  async verifyPin(pin) {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    return res.json();
  },

  // Users Management (Admin)
  async getUsers() {
    const res = await fetch(`${API_BASE}/users`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
    return data;
  },

  async createUser(userData) {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create user');
    return data;
  },

  async updateUser(id, userData) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update user');
    return data;
  },

  async deleteUser(id) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete user');
    return data;
  },

  // Project Settings
  async getProject() {
    const res = await fetch(`${API_BASE}/project`);
    if (!res.ok) throw new Error('Failed to fetch project info');
    return res.json();
  },

  async updateProject(data) {
    const res = await fetch(`${API_BASE}/project`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update project settings');
    return result;
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(catData) {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(catData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create category');
    return data;
  },

  async updateCategory(id, catData) {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(catData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update category');
    return data;
  },

  async deleteCategory(id) {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete category');
    return data;
  },

  // Tasks
  async getTasks(params = {}) {
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

  async createTask(data) {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create task');
    return result;
  },

  async updateTask(id, data) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update task');
    return result;
  },

  async updateTaskStatus(id, status) {
    const res = await fetch(`${API_BASE}/tasks/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update task status');
    return result;
  },

  async deleteTask(id) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete task');
    return result;
  },

  // Metrics
  async getMetrics() {
    const res = await fetch(`${API_BASE}/metrics`);
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
  },

  // Reset
  async resetDefaults() {
    const res = await fetch(`${API_BASE}/reset`, {
      method: 'POST',
      headers: getHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to reset demo data');
    return result;
  },

  // Backup
  async exportJSON() {
    const res = await fetch(`${API_BASE}/backup/export`);
    if (!res.ok) throw new Error('Failed to export backup');
    return res.json();
  },

  async importJSON(jsonData) {
    const res = await fetch(`${API_BASE}/backup/import`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(jsonData)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to import backup');
    return result;
  },

  getCSVUrl(lang = 'ar') {
    return `${API_BASE}/export/csv?lang=${lang}`;
  }
};

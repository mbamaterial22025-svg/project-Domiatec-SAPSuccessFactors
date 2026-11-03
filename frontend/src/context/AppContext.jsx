import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';
import { api } from '../services/api';
import { cloudStore } from '../services/cloudStore';

const AppContext = createContext();

export function AppProvider({ children }) {
  const params = new URLSearchParams(window.location.search);
  const initialMode = params.get('mode') === 'view' ? 'management' : 'admin';
  const initialLang = params.get('lang') === 'en' ? 'en' : 'ar';

  const [lang, setLang] = useState(() => localStorage.getItem('wk_lang') || initialLang);
  const [role, setRole] = useState(() => localStorage.getItem('wk_role') || initialMode);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('wk_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState('kanban'); // 'kanban', 'timeline', 'executive'
  const [timelineSort, setTimelineSort] = useState('dueDate');

  const [project, setProject] = useState({
    titleAr: 'مشروع تطوير المنصة الرقمية 2026',
    titleEn: 'Digital Platform Development Project 2026',
    wipLimit: 15
  });

  const [tasks, setTasks] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    deadline: 'all',
    assignee: 'all'
  });

  // Modals state
  const [taskModal, setTaskModal] = useState({ isOpen: false, taskId: null, defaultStatus: 'backlog' });
  const [settingsModal, setSettingsModal] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [usersModal, setUsersModal] = useState(false);
  const [categoriesModal, setCategoriesModal] = useState(false);
  const [backupModal, setBackupModal] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(false);

  const t = translations[lang] || translations.ar;

  // Sync HTML direction & language
  useEffect(() => {
    localStorage.setItem('wk_lang', lang);
    const html = document.getElementById('htmlRoot');
    if (html) {
      html.lang = lang;
      html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('wk_role', role);
  }, [role]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('wk_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('wk_user');
    }
  }, [currentUser]);

  // Initial Data & Session Check
  const refreshData = async () => {
    try {
      setLoading(true);
      const [projRes, tasksRes, metricsRes, catRes, meRes] = await Promise.all([
        api.getProject(),
        api.getTasks(filters),
        api.getMetrics(),
        api.getCategories(),
        api.getMe()
      ]);

      if (projRes.project) setProject(projRes.project);
      if (tasksRes.tasks) setTasks(tasksRes.tasks);
      if (metricsRes.metrics) setMetrics(metricsRes.metrics);
      if (catRes.categories) setCategories(catRes.categories);

      if (meRes.authenticated && meRes.user) {
        setCurrentUser(meRes.user);
        if (meRes.user.role === 'admin') setRole('admin');
      }

      setIsOnline(true);
    } catch (err) {
      console.warn('Backend sync failed, running in resilient mode:', err);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (role !== 'admin') return;
    try {
      const data = await api.getUsers();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  // Cloud Firestore synchronization on mount to prevent data loss on clearing browser cache
  useEffect(() => {
    async function initCloudSync() {
      try {
        const res = await cloudStore.syncFromCloud();
        if (res && res.success) {
          setIsOnline(true);
        }
      } catch (e) {
        console.warn('Initial cloud sync error:', e);
      } finally {
        refreshData();
      }
    }
    initCloudSync();
  }, []);

  useEffect(() => {
    refreshData();
  }, [filters]);

  useEffect(() => {
    if (usersModal && role === 'admin') {
      fetchUsers();
    }
  }, [usersModal, role]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  const requestRoleSwitch = (targetRole) => {
    if (targetRole === 'management') {
      setRole('management');
    } else {
      if (role === 'admin' && currentUser) return;
      setLoginModal(true);
    }
  };

  // Auth Handlers
  const handleLogin = async ({ username, password, pin }) => {
    try {
      const res = await api.login({ username, password, pin });
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setRole(res.user.role || 'admin');
        setLoginModal(false);
        await refreshData();
        return { success: true };
      }
      return { success: false, error: res.error || t.pinError };
    } catch (err) {
      return { success: false, error: err.message || t.pinError };
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setRole('management');
    await refreshData();
  };

  // User Management
  const saveUser = async (userData) => {
    try {
      if (userData.id) {
        await api.updateUser(userData.id, userData);
      } else {
        await api.createUser(userData);
      }
      await fetchUsers();
    } catch (err) {
      throw err;
    }
  };

  const deleteUser = async (userId) => {
    try {
      await api.deleteUser(userId);
      await fetchUsers();
    } catch (err) {
      throw err;
    }
  };

  // Category Management
  const saveCategory = async (catData) => {
    try {
      if (catData.isEdit) {
        await api.updateCategory(catData.id, catData);
      } else {
        await api.createCategory(catData);
      }
      const catRes = await api.getCategories();
      if (catRes.categories) setCategories(catRes.categories);
      await refreshData();
    } catch (err) {
      throw err;
    }
  };

  const deleteCategory = async (catId) => {
    try {
      await api.deleteCategory(catId);
      const catRes = await api.getCategories();
      if (catRes.categories) setCategories(catRes.categories);
      await refreshData();
    } catch (err) {
      throw err;
    }
  };

  // Task Handlers
  const moveTask = async (taskId, newStatus) => {
    if (role !== 'admin') return;

    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await api.updateTaskStatus(taskId, newStatus);
      const metricsRes = await api.getMetrics();
      if (metricsRes.metrics) setMetrics(metricsRes.metrics);
    } catch (err) {
      console.error('Failed to update task status:', err);
      refreshData();
    }
  };

  const saveTask = async (taskData) => {
    if (role !== 'admin') return;
    try {
      if (taskData.id) {
        await api.updateTask(taskData.id, taskData);
      } else {
        await api.createTask(taskData);
      }
      setTaskModal({ isOpen: false, taskId: null, defaultStatus: 'backlog' });
      await refreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteTask = async (taskId) => {
    if (role !== 'admin') return;
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا النشاط؟' : 'Are you sure you want to delete this task?')) return;

    try {
      await api.deleteTask(taskId);
      await refreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  const saveSettings = async (settingsData) => {
    if (role !== 'admin') return;
    try {
      const res = await api.updateProject(settingsData);
      if (res.project) setProject(res.project);
      setSettingsModal(false);
      await refreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  const resetData = async () => {
    if (role !== 'admin') return;
    try {
      await api.resetDefaults();
      setResetModal(false);
      await refreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        t,
        role,
        currentUser,
        currentView,
        setCurrentView,
        timelineSort,
        setTimelineSort,
        project,
        tasks,
        metrics,
        categories,
        users,
        loading,
        isOnline,
        filters,
        setFilters,
        taskModal,
        setTaskModal,
        settingsModal,
        setSettingsModal,
        loginModal,
        setLoginModal,
        usersModal,
        setUsersModal,
        categoriesModal,
        setCategoriesModal,
        backupModal,
        setBackupModal,
        resetModal,
        setResetModal,
        adminSidebarOpen,
        setAdminSidebarOpen,
        toggleLanguage,
        requestRoleSwitch,
        handleLogin,
        handleLogout,
        saveUser,
        deleteUser,
        saveCategory,
        deleteCategory,
        moveTask,
        saveTask,
        deleteTask,
        saveSettings,
        resetData,
        refreshData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

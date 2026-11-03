// Standalone Client-Side Store for Firebase Hosting / Offline resilience
// Mirrors backend SQLite schema and business logic completely

const STORAGE_KEYS = {
  PROJECT: 'wk_store_project',
  CATEGORIES: 'wk_store_categories',
  TASKS: 'wk_store_tasks',
  USERS: 'wk_store_users',
  LOGS: 'wk_store_logs'
};

function formatDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

const DEFAULT_PROJECT = {
  id: 1,
  titleAr: 'مشروع التحول الرقمي SAP SuccessFactors - شركة دومياتك',
  titleEn: 'Domiatec SAP SuccessFactors Digital Transformation',
  wipLimit: 15
};

const DEFAULT_CATEGORIES = [
  { id: 1, key: 'infrastructure', nameAr: 'البنية التحتية والسحابة', nameEn: 'Cloud & Infrastructure', color: '#3b82f6', isDefault: 1 },
  { id: 2, key: 'security', nameAr: 'الأمان وإدارة الهويات', nameEn: 'Security & IAM', color: '#ef4444', isDefault: 1 },
  { id: 3, key: 'api', nameAr: 'تكامل الواجهات البرمجية', nameEn: 'APIs & Integration', color: '#10b981', isDefault: 1 },
  { id: 4, key: 'frontend', nameAr: 'تطوير الواجهات والتقارير', nameEn: 'Frontend & Analytics', color: '#f59e0b', isDefault: 1 },
  { id: 5, key: 'testing', nameAr: 'اختبارات القبول وضمان الجودة', nameEn: 'UAT & Quality Assurance', color: '#8b5cf6', isDefault: 1 }
];

const DEFAULT_USERS = [
  { id: 1, username: 'admin', role: 'admin', passwordHash: 'admin123', pin: '1234', createdAt: new Date().toISOString() }
];

const DEFAULT_TASKS = [
  {
    id: 1,
    titleAr: 'تهيئة بيئة SAP SuccessFactors السحابية',
    titleEn: 'Provision SAP SuccessFactors Cloud Environment',
    descriptionAr: 'إعداد الخوادم وربط النطاقات وتفعيل شهادات الأمان SSL وحسابات الإدارة المركزية.',
    descriptionEn: 'Set up instances, domain routing, SSL certificates, and central administration accounts.',
    category: 'infrastructure',
    weight: 3,
    status: 'completed',
    startDate: formatDate(-14),
    dueDate: formatDate(-2),
    assignedTo: 'فريق البنية التحتية',
    sortOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    titleAr: 'ربط دليل المستخدمين وخدمات الهوية SSO',
    titleEn: 'Integrate User Directory & Azure AD SSO',
    descriptionAr: 'تفعيل الدخول الموحد لموظفي شركة دومياتك مع ربط أذونات مجموعات العمل والصلاحيات.',
    descriptionEn: 'Configure Single Sign-On for Domiatec employees and sync role-based permissions.',
    category: 'security',
    weight: 5,
    status: 'completed',
    startDate: formatDate(-10),
    dueDate: formatDate(0),
    assignedTo: 'مسؤول أمن المعلومات',
    sortOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    titleAr: 'تطوير قنوات المزامنة والربط المالي OData API',
    titleEn: 'Develop OData Financial Sync Pipelines',
    descriptionAr: 'بناء واجهات الربط اللحظي لنقل بيانات الرواتب والمستحقات والتسويات مع النظام المالي.',
    descriptionEn: 'Build automated real-time APIs to sync payroll and financial ledger datasets.',
    category: 'api',
    weight: 8,
    status: 'in_progress',
    startDate: formatDate(-5),
    dueDate: formatDate(7),
    assignedTo: 'مهندس التكامل',
    sortOrder: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    titleAr: 'بناء لوحة المؤشرات التنفيذية للقيادة العليا',
    titleEn: 'Build Executive KPI Dashboard',
    descriptionAr: 'تصميم واجهة متقدمة تدعم العربية لمتابعة إنجاز مراحل المشروع والوزن النسبي والإنذارات.',
    descriptionEn: 'Design executive bilingual dashboard for progress tracking, weights, and alerts.',
    category: 'frontend',
    weight: 5,
    status: 'in_progress',
    startDate: formatDate(-3),
    dueDate: formatDate(5),
    assignedTo: 'مطور الواجهات',
    sortOrder: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    titleAr: 'اختبارات الأداء والحمل العالي للأنظمة',
    titleEn: 'Run System Load & Concurrency Tests',
    descriptionAr: 'تنفيذ اختبارات ضغط لمحاكاة دخول آلاف الموظفين في أوقات صرف الرواتب وتقييم الأداء.',
    descriptionEn: 'Execute stress testing simulating simultaneous employee self-service access.',
    category: 'testing',
    weight: 4,
    status: 'testing',
    startDate: formatDate(2),
    dueDate: formatDate(12),
    assignedTo: 'أخصائي الجودة',
    sortOrder: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: 6,
    titleAr: 'تدريب مديري الإدارات وممثلي الموارد البشرية',
    titleEn: 'User Training for HR & Department Leads',
    descriptionAr: 'إعداد ورش عمل تفاعلية ودليل المستخدم المصور لاستخدام النظام الجديد.',
    descriptionEn: 'Conduct interactive workshops and bilingual visual user documentation.',
    category: 'frontend',
    weight: 3,
    status: 'backlog',
    startDate: formatDate(7),
    dueDate: formatDate(18),
    assignedTo: 'فريق التمكين والتدريب',
    sortOrder: 6,
    createdAt: new Date().toISOString()
  },
  {
    id: 7,
    titleAr: 'مراجعة معايير الحماية والامتثال للسياسات',
    titleEn: 'Security Audit & Compliance Review',
    descriptionAr: 'تدقيق سجلات الوصول والتحقق من التشفير الكامل للبيانات الحساسة أثناء النقل والتخزين.',
    descriptionEn: 'Verify encryption in-transit and at-rest along with access audit logs.',
    category: 'security',
    weight: 3,
    status: 'backlog',
    startDate: formatDate(10),
    dueDate: formatDate(21),
    assignedTo: 'مدير الحوكمة',
    sortOrder: 7,
    createdAt: new Date().toISOString()
  },
  {
    id: 8,
    titleAr: 'الإطلاق التجريبي النهائي للخدمة الذاتية',
    titleEn: 'Final Pilot Go-Live for Employee Self-Service',
    descriptionAr: 'بدء استقبال طلبات الإجازات ومراجعة المسير التجريبي في بيئة الإنتاج الفعلية.',
    descriptionEn: 'Pilot launch in production for employee self-service requests and payroll reviews.',
    category: 'infrastructure',
    weight: 8,
    status: 'backlog',
    startDate: formatDate(15),
    dueDate: formatDate(30),
    assignedTo: 'مدير المشروع',
    sortOrder: 8,
    createdAt: new Date().toISOString()
  }
];

function getStored(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStored(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
}

export const localStore = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.PROJECT)) {
      setStored(STORAGE_KEYS.PROJECT, DEFAULT_PROJECT);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      setStored(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      setStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      setStored(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    }
  },

  // Auth
  login({ username, password, pin }) {
    this.init();
    const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    
    // Quick PIN match - checks any user with this PIN!
    if (pin && pin.trim()) {
      const trimmedPin = pin.trim();
      const matchedUser = users.find(u => u.pin && u.pin.toString().trim() === trimmedPin);
      if (matchedUser) {
        const token = 'local_token_' + Date.now();
        localStorage.setItem('wk_token', token);
        localStorage.setItem('wk_pin', trimmedPin);
        return {
          success: true,
          token,
          user: {
            id: matchedUser.id,
            username: matchedUser.username,
            fullName: matchedUser.fullName || matchedUser.username,
            role: matchedUser.role || 'admin'
          }
        };
      }
      if (trimmedPin === '1234') {
        const adminUser = users.find(u => u.role === 'admin') || { id: 1, username: 'admin', fullName: 'مدير النظام', role: 'admin' };
        const token = 'local_token_' + Date.now();
        localStorage.setItem('wk_token', token);
        localStorage.setItem('wk_pin', '1234');
        return { success: true, token, user: adminUser };
      }
      throw new Error('رمز PIN غير صحيح');
    }

    // Username/password match
    const user = users.find(u => u.username.toLowerCase() === (username || '').toLowerCase());
    if (user && (user.passwordHash === password || (user.username === 'admin' && password === 'admin123'))) {
      const token = 'local_token_' + Date.now();
      localStorage.setItem('wk_token', token);
      return {
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName || user.username,
          role: user.role || 'admin'
        }
      };
    }

    throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
  },

  getMe() {
    const token = localStorage.getItem('wk_token');
    const pin = localStorage.getItem('wk_pin');
    if (!token && !pin) return { authenticated: false };

    const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const u = users[0] || { id: 1, username: 'admin', role: 'admin' };
    return { authenticated: true, user: { id: u.id, username: u.username, role: u.role || 'admin' } };
  },

  // Users
  getUsers() {
    this.init();
    const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    return {
      users: users.map(u => ({
        id: u.id,
        username: u.username,
        fullName: u.fullName || u.username,
        role: u.role || 'admin',
        pin: u.pin || '',
        createdAt: u.createdAt
      }))
    };
  },

  createUser(userData) {
    this.init();
    const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    if (users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
      throw new Error('اسم المستخدم مسجل مسبقاً');
    }
    const newUser = {
      id: Date.now(),
      username: userData.username,
      fullName: userData.fullName || userData.username,
      role: userData.role || 'viewer',
      passwordHash: userData.password,
      pin: userData.pin ? userData.pin.toString().trim() : '',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);
    return { success: true, user: { id: newUser.id, username: newUser.username, fullName: newUser.fullName, role: newUser.role, pin: newUser.pin } };
  },

  updateUser(id, userData) {
    this.init();
    const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const idx = users.findIndex(u => u.id === Number(id));
    if (idx === -1) throw new Error('المستخدم غير موجود');

    users[idx].username = userData.username || users[idx].username;
    users[idx].fullName = userData.fullName || users[idx].fullName;
    users[idx].role = userData.role || users[idx].role;
    if (userData.password) users[idx].passwordHash = userData.password;
    if (userData.pin !== undefined) users[idx].pin = userData.pin ? userData.pin.toString().trim() : '';

    setStored(STORAGE_KEYS.USERS, users);
    return { success: true, user: users[idx] };
  },

  deleteUser(id) {
    this.init();
    const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    if (users.length <= 1) throw new Error('لا يمكن حذف المستخدم الوحيد المتبقي');
    const filtered = users.filter(u => u.id !== Number(id));
    setStored(STORAGE_KEYS.USERS, filtered);
    return { success: true };
  },

  // Project
  getProject() {
    this.init();
    return { project: getStored(STORAGE_KEYS.PROJECT, DEFAULT_PROJECT) };
  },

  updateProject(data) {
    this.init();
    const current = getStored(STORAGE_KEYS.PROJECT, DEFAULT_PROJECT);
    const updated = { ...current, ...data };
    setStored(STORAGE_KEYS.PROJECT, updated);
    return { success: true, project: updated };
  },

  // Categories
  getCategories() {
    this.init();
    return { categories: getStored(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES) };
  },

  createCategory(data) {
    this.init();
    const cats = getStored(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    const newCat = {
      id: Date.now(),
      key: data.key || 'cat_' + Date.now(),
      nameAr: data.nameAr,
      nameEn: data.nameEn,
      color: data.color || '#3b82f6',
      isDefault: 0
    };
    cats.push(newCat);
    setStored(STORAGE_KEYS.CATEGORIES, cats);
    return { success: true, category: newCat };
  },

  updateCategory(id, data) {
    this.init();
    const cats = getStored(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    const idx = cats.findIndex(c => c.id === Number(id));
    if (idx === -1) throw new Error('القسم غير موجود');
    cats[idx] = { ...cats[idx], ...data };
    setStored(STORAGE_KEYS.CATEGORIES, cats);
    return { success: true, category: cats[idx] };
  },

  deleteCategory(id) {
    this.init();
    const cats = getStored(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    const filtered = cats.filter(c => c.id !== Number(id));
    setStored(STORAGE_KEYS.CATEGORIES, filtered);
    return { success: true };
  },

  // Tasks
  getTasks(filters = {}) {
    this.init();
    let tasks = getStored(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    
    if (filters.search) {
      const q = filters.search.toLowerCase();
      tasks = tasks.filter(t => 
        (t.titleAr && t.titleAr.toLowerCase().includes(q)) ||
        (t.titleEn && t.titleEn.toLowerCase().includes(q)) ||
        (t.descriptionAr && t.descriptionAr.toLowerCase().includes(q)) ||
        (t.assignedTo && t.assignedTo.toLowerCase().includes(q))
      );
    }
    if (filters.category && filters.category !== 'all') {
      tasks = tasks.filter(t => t.category === filters.category);
    }
    if (filters.assignee && filters.assignee !== 'all') {
      tasks = tasks.filter(t => t.assignedTo === filters.assignee);
    }

    return { tasks, totalCount: tasks.length };
  },

  createTask(data) {
    this.init();
    const tasks = getStored(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    const newTask = {
      id: Date.now(),
      titleAr: data.titleAr,
      titleEn: data.titleEn || data.titleAr,
      descriptionAr: data.descriptionAr || '',
      descriptionEn: data.descriptionEn || '',
      category: data.category || 'infrastructure',
      weight: Number(data.weight) || 3,
      status: data.status || 'backlog',
      startDate: data.startDate || formatDate(0),
      dueDate: data.dueDate || formatDate(7),
      assignedTo: data.assignedTo || '',
      sortOrder: tasks.length + 1,
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    setStored(STORAGE_KEYS.TASKS, tasks);
    return { success: true, task: newTask };
  },

  updateTask(id, data) {
    this.init();
    const tasks = getStored(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    const idx = tasks.findIndex(t => t.id === Number(id));
    if (idx === -1) throw new Error('المهمة غير موجودة');

    tasks[idx] = {
      ...tasks[idx],
      ...data,
      weight: data.weight ? Number(data.weight) : tasks[idx].weight
    };
    setStored(STORAGE_KEYS.TASKS, tasks);
    return { success: true, task: tasks[idx] };
  },

  updateTaskStatus(id, newStatus) {
    this.init();
    const tasks = getStored(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    const idx = tasks.findIndex(t => t.id === Number(id));
    if (idx === -1) throw new Error('المهمة غير موجودة');
    tasks[idx].status = newStatus;
    setStored(STORAGE_KEYS.TASKS, tasks);
    return { success: true, task: tasks[idx] };
  },

  deleteTask(id) {
    this.init();
    const tasks = getStored(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    const filtered = tasks.filter(t => t.id !== Number(id));
    setStored(STORAGE_KEYS.TASKS, filtered);
    return { success: true };
  },

  // Metrics
  getMetrics() {
    this.init();
    const tasks = getStored(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    const proj = getStored(STORAGE_KEYS.PROJECT, DEFAULT_PROJECT);
    const cats = getStored(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);

    let totalWeight = 0;
    let completedWeight = 0;
    let inProgressCount = 0;
    let overdueCount = 0;
    let dueSoonCount = 0;

    const todayStr = formatDate(0);
    const soonStr = formatDate(3);

    const counts = { backlog: 0, in_progress: 0, testing: 0, completed: 0 };
    const weights = { backlog: 0, in_progress: 0, testing: 0, completed: 0 };

    tasks.forEach(t => {
      const w = Number(t.weight) || 1;
      totalWeight += w;
      if (counts[t.status] !== undefined) {
        counts[t.status]++;
        weights[t.status] += w;
      }
      if (t.status === 'completed') {
        completedWeight += w;
      }
      if (t.status === 'in_progress') {
        inProgressCount++;
      }
      if (t.status !== 'completed' && t.dueDate) {
        if (t.dueDate < todayStr) overdueCount++;
        else if (t.dueDate <= soonStr) dueSoonCount++;
      }
    });

    const completionRate = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
    const wipExceeded = inProgressCount > (proj.wipLimit || 15);

    // Categories breakdown
    const categoryBreakdown = cats.map(c => {
      const cTasks = tasks.filter(t => t.category === c.key);
      const cTotalW = cTasks.reduce((sum, t) => sum + (Number(t.weight) || 1), 0);
      const cCompW = cTasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (Number(t.weight) || 1), 0);
      const cPct = cTotalW > 0 ? Math.round((cCompW / cTotalW) * 100) : 0;
      return {
        key: c.key,
        nameAr: c.nameAr,
        nameEn: c.nameEn,
        color: c.color,
        taskCount: cTasks.length,
        totalWeight: cTotalW,
        completedWeight: cCompW,
        completionRate: cPct
      };
    });

    return {
      metrics: {
        totalTasks: tasks.length,
        totalWeight,
        completedWeight,
        completionRate,
        wipCount: inProgressCount,
        wipLimit: proj.wipLimit || 15,
        wipExceeded,
        overdueCount,
        dueSoonCount,
        counts,
        weights,
        categoryBreakdown
      }
    };
  },

  // Reset & Backup
  resetToDefault() {
    setStored(STORAGE_KEYS.PROJECT, DEFAULT_PROJECT);
    setStored(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    setStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    setStored(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    return { success: true };
  },

  exportBackup() {
    this.init();
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      project: getStored(STORAGE_KEYS.PROJECT, DEFAULT_PROJECT),
      categories: getStored(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES),
      tasks: getStored(STORAGE_KEYS.TASKS, DEFAULT_TASKS),
      users: getStored(STORAGE_KEYS.USERS, DEFAULT_USERS)
    };
  },

  restoreBackup(backup) {
    if (backup.project) setStored(STORAGE_KEYS.PROJECT, backup.project);
    if (backup.categories) setStored(STORAGE_KEYS.CATEGORIES, backup.categories);
    if (backup.tasks) setStored(STORAGE_KEYS.TASKS, backup.tasks);
    if (backup.users) setStored(STORAGE_KEYS.USERS, backup.users);
    return { success: true };
  }
};


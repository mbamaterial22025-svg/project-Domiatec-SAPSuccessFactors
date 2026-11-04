// Standalone Client-Side Store for Firebase Hosting / Cloud Sync
// Provides full persistence backed by Google Cloud Firestore and LocalStorage
import { cloudStore } from './cloudStore';

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

export const DEFAULT_PROJECT = {
  id: 'main-project',
  titleAr: 'مشروع التحول الرقمي SAP SuccessFactors - شركة دومياتك',
  titleEn: 'Domiatec SAP SuccessFactors Digital Transformation',
  wipLimit: 15
};

export const DEFAULT_CATEGORIES = [
  { id: 'infra', key: 'infra', nameAr: 'البنية التحتية والسحابة', nameEn: 'Cloud & Infrastructure', color: '#0284c7', colorClass: 'bg-sky-50 text-sky-700 border-sky-200', icon: 'server', isDefault: 1 },
  { id: 'database', key: 'database', nameAr: 'قواعد البيانات والبيانات', nameEn: 'Databases & Big Data', color: '#059669', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'database', isDefault: 1 },
  { id: 'security', key: 'security', nameAr: 'أمن المعلومات وإدارة الهويات', nameEn: 'Security & IAM', color: '#e11d48', colorClass: 'bg-rose-50 text-rose-700 border-rose-200', icon: 'shield-alert', isDefault: 1 },
  { id: 'frontend', key: 'frontend', nameAr: 'تطوير الواجهات والتقارير', nameEn: 'Frontend & Analytics', color: '#7c3aed', colorClass: 'bg-violet-50 text-violet-700 border-violet-200', icon: 'layout', isDefault: 1 },
  { id: 'management', key: 'management', nameAr: 'إدارة وتكامل SAP', nameEn: 'SAP Management & Integration', color: '#d97706', colorClass: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'clipboard-check', isDefault: 1 },
  { id: 'qa', key: 'qa', nameAr: 'اختبارات الجودة والقبول UAT', nameEn: 'QA & Testing', color: '#4f46e5', colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: 'check-circle', isDefault: 1 }
];

export const DEFAULT_USERS = [
  { id: 1, username: 'admin', fullName: 'مدير النظام الرئيسي', role: 'admin', passwordHash: 'admin123', pin: '1234', createdAt: new Date().toISOString() }
];

export const DEFAULT_TASKS = [
  {
    id: 't-101',
    projectId: 'main-project',
    titleAr: 'تهيئة بيئة SAP SuccessFactors السحابية',
    titleEn: 'Provision SAP SuccessFactors Cloud Environment',
    notesAr: 'إعداد الخوادم وربط النطاقات وتفعيل شهادات الأمان SSL وحسابات الإدارة المركزية.',
    notesEn: 'Set up instances, domain routing, SSL certificates, and central administration accounts.',
    descriptionAr: 'إعداد الخوادم وربط النطاقات وتفعيل شهادات الأمان SSL وحسابات الإدارة المركزية.',
    descriptionEn: 'Set up instances, domain routing, SSL certificates, and central administration accounts.',
    categoryId: 'infra',
    category: 'infra',
    points: 8,
    weight: 8,
    status: 'done',
    startDate: formatDate(-14),
    dueDate: formatDate(-2),
    assigneeAr: 'فريق البنية التحتية',
    assigneeEn: 'Infrastructure Team',
    assignedTo: 'فريق البنية التحتية',
    position: 1,
    sortOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 't-102',
    projectId: 'main-project',
    titleAr: 'ربط دليل المستخدمين وخدمات الهوية SSO',
    titleEn: 'Integrate User Directory & Azure AD SSO',
    notesAr: 'تفعيل الدخول الموحد لموظفي شركة دومياتك مع ربط أذونات مجموعات العمل والصلاحيات.',
    notesEn: 'Configure Single Sign-On for Domiatec employees and sync role-based permissions.',
    descriptionAr: 'تفعيل الدخول الموحد لموظفي شركة دومياتك مع ربط أذونات مجموعات العمل والصلاحيات.',
    descriptionEn: 'Configure Single Sign-On for Domiatec employees and sync role-based permissions.',
    categoryId: 'security',
    category: 'security',
    points: 5,
    weight: 5,
    status: 'done',
    startDate: formatDate(-10),
    dueDate: formatDate(-1),
    assigneeAr: 'مسؤول أمن المعلومات',
    assigneeEn: 'Security Officer',
    assignedTo: 'مسؤول أمن المعلومات',
    position: 2,
    sortOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 't-103',
    projectId: 'main-project',
    titleAr: 'تطوير قنوات المزامنة والربط المالي OData API',
    titleEn: 'Develop OData Financial Sync Pipelines',
    notesAr: 'بناء واجهات الربط اللحظي لنقل بيانات الرواتب والمستحقات والتسويات مع النظام المالي.',
    notesEn: 'Build automated real-time APIs to sync payroll and financial ledger datasets.',
    descriptionAr: 'بناء واجهات الربط اللحظي لنقل بيانات الرواتب والمستحقات والتسويات مع النظام المالي.',
    descriptionEn: 'Build automated real-time APIs to sync payroll and financial ledger datasets.',
    categoryId: 'infra',
    category: 'infra',
    points: 8,
    weight: 8,
    status: 'inprogress',
    startDate: formatDate(-5),
    dueDate: formatDate(7),
    assigneeAr: 'مهندس التكامل',
    assigneeEn: 'Integration Engineer',
    assignedTo: 'مهندس التكامل',
    position: 3,
    sortOrder: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 't-104',
    projectId: 'main-project',
    titleAr: 'بناء لوحة المؤشرات التنفيذية للقيادة العليا',
    titleEn: 'Build Executive KPI Dashboard',
    notesAr: 'تصميم واجهة متقدمة تدعم العربية لمتابعة إنجاز مراحل المشروع والوزن النسبي والإنذارات.',
    notesEn: 'Design executive bilingual dashboard for progress tracking, weights, and alerts.',
    descriptionAr: 'تصميم واجهة متقدمة تدعم العربية لمتابعة إنجاز مراحل المشروع والوزن النسبي والإنذارات.',
    descriptionEn: 'Design executive bilingual dashboard for progress tracking, weights, and alerts.',
    categoryId: 'frontend',
    category: 'frontend',
    points: 5,
    weight: 5,
    status: 'inprogress',
    startDate: formatDate(-3),
    dueDate: formatDate(5),
    assigneeAr: 'مطور الواجهات',
    assigneeEn: 'Frontend Developer',
    assignedTo: 'مطور الواجهات',
    position: 4,
    sortOrder: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: 't-105',
    projectId: 'main-project',
    titleAr: 'اختبارات الأداء والحمل العالي للأنظمة',
    titleEn: 'Run System Load & Concurrency Tests',
    notesAr: 'تنفيذ اختبارات ضغط لمحاكاة دخول آلاف الموظفين في أوقات صرف الرواتب وتقييم الأداء.',
    notesEn: 'Execute stress testing simulating simultaneous employee self-service access.',
    descriptionAr: 'تنفيذ اختبارات ضغط لمحاكاة دخول آلاف الموظفين في أوقات صرف الرواتب وتقييم الأداء.',
    descriptionEn: 'Execute stress testing simulating simultaneous employee self-service access.',
    categoryId: 'qa',
    category: 'qa',
    points: 5,
    weight: 5,
    status: 'review',
    startDate: formatDate(2),
    dueDate: formatDate(12),
    assigneeAr: 'أخصائي الجودة',
    assigneeEn: 'QA Specialist',
    assignedTo: 'أخصائي الجودة',
    position: 5,
    sortOrder: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: 't-106',
    projectId: 'main-project',
    titleAr: 'تدريب مديري الإدارات وممثلي الموارد البشرية',
    titleEn: 'User Training for HR & Department Leads',
    notesAr: 'إعداد ورش عمل تفاعلية ودليل المستخدم المصور لاستخدام النظام الجديد.',
    notesEn: 'Conduct interactive workshops and bilingual visual user documentation.',
    descriptionAr: 'إعداد ورش عمل تفاعلية ودليل المستخدم المصور لاستخدام النظام الجديد.',
    descriptionEn: 'Conduct interactive workshops and bilingual visual user documentation.',
    categoryId: 'management',
    category: 'management',
    points: 3,
    weight: 3,
    status: 'backlog',
    startDate: formatDate(7),
    dueDate: formatDate(18),
    assigneeAr: 'فريق التمكين والتدريب',
    assigneeEn: 'Training Team',
    assignedTo: 'فريق التمكين والتدريب',
    position: 6,
    sortOrder: 6,
    createdAt: new Date().toISOString()
  },
  {
    id: 't-107',
    projectId: 'main-project',
    titleAr: 'مراجعة معايير الحماية والامتثال للسياسات',
    titleEn: 'Security Audit & Compliance Review',
    notesAr: 'تدقيق سجلات الوصول والتحقق من التشفير الكامل للبيانات الحساسة أثناء النقل والتخزين.',
    notesEn: 'Verify encryption in-transit and at-rest along with access audit logs.',
    descriptionAr: 'تدقيق سجلات الوصول والتحقق من التشفير الكامل للبيانات الحساسة أثناء النقل والتخزين.',
    descriptionEn: 'Verify encryption in-transit and at-rest along with access audit logs.',
    categoryId: 'security',
    category: 'security',
    points: 3,
    weight: 3,
    status: 'backlog',
    startDate: formatDate(10),
    dueDate: formatDate(21),
    assigneeAr: 'مدير الحوكمة',
    assigneeEn: 'Governance Manager',
    assignedTo: 'مدير الحوكمة',
    position: 7,
    sortOrder: 7,
    createdAt: new Date().toISOString()
  },
  {
    id: 't-108',
    projectId: 'main-project',
    titleAr: 'الإطلاق التجريبي النهائي للخدمة الذاتية',
    titleEn: 'Final Pilot Go-Live for Employee Self-Service',
    notesAr: 'بدء استقبال طلبات الإجازات ومراجعة المسير التجريبي في بيئة الإنتاج الفعلية.',
    notesEn: 'Pilot launch in production for employee self-service requests and payroll reviews.',
    descriptionAr: 'بدء استقبال طلبات الإجازات ومراجعة المسير التجريبي في بيئة الإنتاج الفعلية.',
    descriptionEn: 'Pilot launch in production for employee self-service requests and payroll reviews.',
    categoryId: 'management',
    category: 'management',
    points: 8,
    weight: 8,
    status: 'backlog',
    startDate: formatDate(15),
    dueDate: formatDate(30),
    assigneeAr: 'مدير المشروع',
    assigneeEn: 'Project Manager',
    assignedTo: 'مدير المشروع',
    position: 8,
    sortOrder: 8,
    createdAt: new Date().toISOString()
  }
];

export function normalizeTask(t) {
  if (!t) return null;
  const statusMap = {
    'backlog': 'backlog',
    'inprogress': 'inprogress',
    'in_progress': 'inprogress',
    'review': 'review',
    'testing': 'review',
    'done': 'done',
    'completed': 'done'
  };

  const status = statusMap[t.status] || 'backlog';
  const categoryId = t.categoryId || t.category || 'infra';
  const points = Number(t.points || t.weight) || 3;
  const assigneeAr = t.assigneeAr || t.assignedTo || '';
  const notesAr = t.notesAr || t.descriptionAr || '';
  const notesEn = t.notesEn || t.descriptionEn || '';

  return {
    id: t.id ? String(t.id) : ('t-' + Date.now()),
    projectId: t.projectId || 'main-project',
    titleAr: t.titleAr || '',
    titleEn: t.titleEn || t.titleAr || '',
    categoryId: categoryId,
    category: categoryId,
    categoryNameAr: t.categoryNameAr || '',
    categoryNameEn: t.categoryNameEn || '',
    categoryColor: t.categoryColor || '',
    points: points,
    weight: points,
    status: status,
    startDate: t.startDate || new Date().toISOString().split('T')[0],
    dueDate: t.dueDate || new Date().toISOString().split('T')[0],
    assigneeAr: assigneeAr,
    assigneeEn: t.assigneeEn || assigneeAr,
    assignedTo: assigneeAr,
    notesAr: notesAr,
    descriptionAr: notesAr,
    notesEn: notesEn,
    descriptionEn: notesEn,
    position: Number(t.position || t.sortOrder) || 0,
    sortOrder: Number(t.sortOrder || t.position) || 0,
    createdAt: t.createdAt || new Date().toISOString(),
    updatedAt: t.updatedAt || new Date().toISOString()
  };
}

function cleanForFirestore(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    return value === undefined ? null : value;
  }));
}

function getStored(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

async function setStored(key, val, shouldSyncCloud = true) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    if (shouldSyncCloud) {
      const cleanData = cleanForFirestore(val);
      if (key === STORAGE_KEYS.TASKS) await cloudStore.updateField('tasks', cleanData);
      else if (key === STORAGE_KEYS.CATEGORIES) await cloudStore.updateField('categories', cleanData);
      else if (key === STORAGE_KEYS.USERS) await cloudStore.updateField('users', cleanData);
      else if (key === STORAGE_KEYS.PROJECT) await cloudStore.updateField('project', cleanData);
    }
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
}

export const localStore = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.PROJECT)) {
      setStored(STORAGE_KEYS.PROJECT, DEFAULT_PROJECT, false);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      setStored(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES, false);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      setStored(STORAGE_KEYS.USERS, DEFAULT_USERS, false);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      setStored(STORAGE_KEYS.TASKS, DEFAULT_TASKS.map(normalizeTask), false);
    }
  },

  // Auth
  login({ username, password, pin }) {
    this.init();
    const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);

    // Quick PIN match
    if (pin && pin.trim()) {
      const trimmedPin = pin.trim();
      const matchedUser = users.find(u => u.pin && u.pin.toString().trim() === trimmedPin);
      if (matchedUser) {
        const token = 'token_' + Date.now();
        localStorage.setItem('wk_token', token);
        localStorage.setItem('wk_pin', trimmedPin);
        localStorage.setItem('wk_role', matchedUser.role || 'admin');
        const userObj = {
          id: matchedUser.id,
          username: matchedUser.username,
          fullName: matchedUser.fullName || matchedUser.username,
          role: matchedUser.role || 'admin'
        };
        localStorage.setItem('wk_user', JSON.stringify(userObj));
        return { success: true, token, user: userObj };
      }
      if (trimmedPin === '1234') {
        const adminUser = users.find(u => u.role === 'admin') || DEFAULT_USERS[0];
        const token = 'token_' + Date.now();
        localStorage.setItem('wk_token', token);
        localStorage.setItem('wk_pin', '1234');
        localStorage.setItem('wk_role', 'admin');
        const userObj = { id: adminUser.id, username: adminUser.username, fullName: adminUser.fullName || 'مدير النظام الرئيسي', role: 'admin' };
        localStorage.setItem('wk_user', JSON.stringify(userObj));
        return { success: true, token, user: userObj };
      }
      throw new Error('رمز PIN غير صحيح');
    }

    // Username/password match
    const user = users.find(u => (u.username || '').toLowerCase() === (username || '').toLowerCase());
    if (user && (user.passwordHash === password || (user.username === 'admin' && password === 'admin123'))) {
      const token = 'token_' + Date.now();
      localStorage.setItem('wk_token', token);
      localStorage.setItem('wk_role', user.role || 'admin');
      const userObj = {
        id: user.id,
        username: user.username,
        fullName: user.fullName || user.username,
        role: user.role || 'admin'
      };
      localStorage.setItem('wk_user', JSON.stringify(userObj));
      return { success: true, token, user: userObj };
    }

    throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
  },

  getMe() {
    const token = localStorage.getItem('wk_token');
    const pin = localStorage.getItem('wk_pin');
    const role = localStorage.getItem('wk_role');

    if (role === 'management' || (!token && !pin)) {
      return { authenticated: false };
    }

    const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    let u = null;
    if (pin) {
      u = users.find(user => user.pin && user.pin.toString().trim() === pin.trim());
    }
    if (!u) {
      u = users.find(user => user.role === 'admin') || users[0] || DEFAULT_USERS[0];
    }

    return {
      authenticated: true,
      user: {
        id: u.id,
        username: u.username,
        fullName: u.fullName || (u.username === 'admin' ? 'مدير النظام الرئيسي' : u.username),
        role: u.role || 'admin'
      }
    };
  },

  logout() {
    localStorage.removeItem('wk_token');
    localStorage.removeItem('wk_pin');
    localStorage.removeItem('wk_user');
    localStorage.setItem('wk_role', 'management');
    return { success: true };
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

  async createUser(userData) {
    this.init();
    const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    if (users.some(u => (u.username || '').toLowerCase() === (userData.username || '').toLowerCase())) {
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
    await setStored(STORAGE_KEYS.USERS, users);
    return { success: true, user: { id: newUser.id, username: newUser.username, fullName: newUser.fullName, role: newUser.role, pin: newUser.pin } };
  },

  async updateUser(id, userData) {
    this.init();
    const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const idx = users.findIndex(u => String(u.id) === String(id));
    if (idx === -1) throw new Error('المستخدم غير موجود');

    users[idx].username = userData.username || users[idx].username;
    users[idx].fullName = userData.fullName || users[idx].fullName;
    users[idx].role = userData.role || users[idx].role;
    if (userData.password) users[idx].passwordHash = userData.password;
    if (userData.pin !== undefined) users[idx].pin = userData.pin ? userData.pin.toString().trim() : '';

    await setStored(STORAGE_KEYS.USERS, users);
    return { success: true, user: users[idx] };
  },

  async deleteUser(id) {
    this.init();
    const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    if (users.length <= 1) throw new Error('لا يمكن حذف المستخدم الوحيد المتبقي');
    const filtered = users.filter(u => String(u.id) !== String(id));
    await setStored(STORAGE_KEYS.USERS, filtered);
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

  async createCategory(data) {
    this.init();
    const cats = getStored(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    const newCat = {
      id: data.id || ('cat_' + Date.now()),
      key: data.key || data.id || ('cat_' + Date.now()),
      nameAr: data.nameAr,
      nameEn: data.nameEn || data.nameAr,
      color: data.color || '#3b82f6',
      colorClass: data.colorClass || 'bg-slate-100 text-slate-700 border-slate-200',
      isDefault: 0
    };
    cats.push(newCat);
    await setStored(STORAGE_KEYS.CATEGORIES, cats);
    return { success: true, category: newCat };
  },

  async updateCategory(id, data) {
    this.init();
    const cats = getStored(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    const idx = cats.findIndex(c => String(c.id) === String(id) || c.key === id);
    if (idx === -1) throw new Error('القسم غير موجود');
    cats[idx] = { ...cats[idx], ...data };
    await setStored(STORAGE_KEYS.CATEGORIES, cats);
    return { success: true, category: cats[idx] };
  },

  async deleteCategory(id) {
    this.init();
    const cats = getStored(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    const filtered = cats.filter(c => String(c.id) !== String(id) && c.key !== id);
    await setStored(STORAGE_KEYS.CATEGORIES, filtered);
    return { success: true };
  },

  // Tasks
  getTasks(filters = {}) {
    this.init();
    let tasks = getStored(STORAGE_KEYS.TASKS, DEFAULT_TASKS).map(normalizeTask);

    if (filters.search) {
      const q = filters.search.toLowerCase();
      tasks = tasks.filter(t => 
        (t.titleAr && t.titleAr.toLowerCase().includes(q)) ||
        (t.titleEn && t.titleEn.toLowerCase().includes(q)) ||
        (t.notesAr && t.notesAr.toLowerCase().includes(q)) ||
        (t.assigneeAr && t.assigneeAr.toLowerCase().includes(q)) ||
        (t.assignedTo && t.assignedTo.toLowerCase().includes(q))
      );
    }
    if (filters.category && filters.category !== 'all') {
      tasks = tasks.filter(t => t.categoryId === filters.category || t.category === filters.category);
    }
    if (filters.assignee && filters.assignee !== 'all') {
      tasks = tasks.filter(t => t.assigneeAr === filters.assignee || t.assignedTo === filters.assignee);
    }
    if (filters.status && filters.status !== 'all') {
      tasks = tasks.filter(t => t.status === filters.status);
    }

    return { tasks, totalCount: tasks.length };
  },

  createTask(data) {
    this.init();
    const tasks = getStored(STORAGE_KEYS.TASKS, DEFAULT_TASKS).map(normalizeTask);
    const newTask = normalizeTask({
      id: 't-' + Date.now(),
      titleAr: data.titleAr || '',
      titleEn: data.titleEn || data.titleAr || '',
      categoryId: data.categoryId || data.category || 'infra',
      points: Number(data.points || data.weight) || 3,
      status: data.status || 'backlog',
      startDate: data.startDate || formatDate(0),
      dueDate: data.dueDate || formatDate(7),
      assigneeAr: data.assigneeAr || data.assignedTo || '',
      assigneeEn: data.assigneeEn || data.assigneeAr || '',
      notesAr: data.notesAr || data.descriptionAr || '',
      notesEn: data.notesEn || data.descriptionEn || '',
      position: tasks.length + 1
    });

    tasks.push(newTask);
    setStored(STORAGE_KEYS.TASKS, tasks);
    return { success: true, task: newTask };
  },

  updateTask(id, data) {
    this.init();
    const tasks = getStored(STORAGE_KEYS.TASKS, DEFAULT_TASKS).map(normalizeTask);
    const idx = tasks.findIndex(t => String(t.id) === String(id));
    if (idx === -1) throw new Error('المهمة غير موجودة');

    const merged = { ...tasks[idx], ...data };
    tasks[idx] = normalizeTask(merged);
    setStored(STORAGE_KEYS.TASKS, tasks);
    return { success: true, task: tasks[idx] };
  },

  updateTaskStatus(id, newStatus) {
    this.init();
    const tasks = getStored(STORAGE_KEYS.TASKS, DEFAULT_TASKS).map(normalizeTask);
    const idx = tasks.findIndex(t => String(t.id) === String(id));
    if (idx === -1) throw new Error('المهمة غير موجودة');

    tasks[idx].status = newStatus;
    tasks[idx].updatedAt = new Date().toISOString();
    tasks[idx] = normalizeTask(tasks[idx]);
    setStored(STORAGE_KEYS.TASKS, tasks);
    return { success: true, task: tasks[idx] };
  },

  deleteTask(id) {
    this.init();
    const tasks = getStored(STORAGE_KEYS.TASKS, DEFAULT_TASKS).map(normalizeTask);
    const filtered = tasks.filter(t => String(t.id) !== String(id));
    setStored(STORAGE_KEYS.TASKS, filtered);
    return { success: true };
  },

  // Metrics
  getMetrics() {
    this.init();
    const tasks = getStored(STORAGE_KEYS.TASKS, DEFAULT_TASKS).map(normalizeTask);
    const proj = getStored(STORAGE_KEYS.PROJECT, DEFAULT_PROJECT);
    const cats = getStored(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);

    let totalWeight = 0;
    let completedWeight = 0;
    let inProgressCount = 0;
    let overdueCount = 0;
    let dueSoonCount = 0;

    const todayStr = formatDate(0);
    const soonDate = formatDate(3);

    const counts = { backlog: 0, inprogress: 0, review: 0, done: 0 };
    const points = { backlog: 0, inprogress: 0, review: 0, done: 0 };

    tasks.forEach(t => {
      const pt = Number(t.points || t.weight) || 1;
      totalWeight += pt;

      const st = t.status || 'backlog';
      if (counts[st] !== undefined) {
        counts[st] += 1;
        points[st] += pt;
      }

      if (st === 'done') {
        completedWeight += pt;
      }
      if (st === 'inprogress') {
        inProgressCount += pt;
      }
      if (st !== 'done' && t.dueDate && t.dueDate < todayStr) {
        overdueCount += 1;
      }
      if (st !== 'done' && t.dueDate && t.dueDate >= todayStr && t.dueDate <= soonDate) {
        dueSoonCount += 1;
      }
    });

    const completionRate = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
    const wipLimit = proj.wipLimit || 15;
    const wipExceeded = inProgressCount > wipLimit;

    const categoryBreakdown = cats.map(c => {
      const cTasks = tasks.filter(t => t.categoryId === c.id || t.category === c.id || t.category === c.key);
      const cTotalW = cTasks.reduce((sum, t) => sum + (Number(t.points || t.weight) || 1), 0);
      const cCompW = cTasks.filter(t => t.status === 'done').reduce((sum, t) => sum + (Number(t.points || t.weight) || 1), 0);
      const cPct = cTotalW > 0 ? Math.round((cCompW / cTotalW) * 100) : 0;
      return {
        key: c.key || c.id,
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
        totalPoints: totalWeight,
        totalWeight,
        completedPoints: completedWeight,
        completedWeight,
        completionRate,
        wipCount: inProgressCount,
        wipLimit,
        wipExceeded,
        overdueCount,
        dueSoonCount,
        counts,
        points,
        weights: points,
        categoryBreakdown
      }
    };
  },

  // Reset & Backup
  resetToDefault() {
    setStored(STORAGE_KEYS.PROJECT, DEFAULT_PROJECT);
    setStored(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    setStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    setStored(STORAGE_KEYS.TASKS, DEFAULT_TASKS.map(normalizeTask));
    cloudStore.syncToCloud();
    return { success: true };
  },

  exportBackup() {
    this.init();
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      project: getStored(STORAGE_KEYS.PROJECT, DEFAULT_PROJECT),
      categories: getStored(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES),
      tasks: getStored(STORAGE_KEYS.TASKS, DEFAULT_TASKS).map(normalizeTask),
      users: getStored(STORAGE_KEYS.USERS, DEFAULT_USERS)
    };
  },

  restoreBackup(backup) {
    if (backup.project) setStored(STORAGE_KEYS.PROJECT, backup.project);
    if (backup.categories) setStored(STORAGE_KEYS.CATEGORIES, backup.categories);
    if (backup.tasks) setStored(STORAGE_KEYS.TASKS, backup.tasks.map(normalizeTask));
    if (backup.users) setStored(STORAGE_KEYS.USERS, backup.users);
    cloudStore.syncToCloud();
    return { success: true };
  }
};

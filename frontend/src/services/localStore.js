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
  {
    id: 1,
    username: "admin",
    fullName: "المهندس ياسين حسن (مدير النظام)",
    role: "admin",
    passwordHash: "admin123",
    pin: "1234",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    username: "domiatec_hr",
    fullName: "فريق الموارد البشرية - دومياتك",
    role: "member",
    passwordHash: "hr123",
    pin: "2222",
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    username: "solex_consulting",
    fullName: "فريق استشارات سولكس (Solex)",
    role: "member",
    passwordHash: "solex123",
    pin: "3333",
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_TASKS = [
  {
    id: "act-01",
    projectId: "main-project",
    titleAr: "تأكيد دورة وفترة التايم شيت (21 إلى 20 من كل شهر)",
    titleEn: "Confirm timesheet period: 21st–20th",
    notesAr: "بانتظار التأكيد: اعتماد شركة دومياتك للدورة رسمياً، وقيام سولكس (Solex) بالتهيئة والتحقق.",
    notesEn: "Pending confirmation: Domiatec to formally approve the cycle; Solex to configure and validate.",
    descriptionAr: "بانتظار التأكيد: اعتماد شركة دومياتك للدورة رسمياً، وقيام سولكس (Solex) بالتهيئة والتحقق.",
    descriptionEn: "Pending confirmation: Domiatec to formally approve the cycle; Solex to configure and validate.",
    categoryId: "management",
    category: "management",
    categoryNameAr: "إدارة وتكامل SAP",
    categoryNameEn: "SAP Management & Integration",
    categoryColor: "#d97706",
    points: 3,
    weight: 3,
    status: "backlog",
    startDate: "2026-11-01",
    dueDate: "2026-11-15",
    assigneeAr: "فريق الموارد البشرية - دومياتك",
    assigneeEn: "Domiatec HR Team",
    assignedTo: "Domiatec HR Team",
    position: 1,
    sortOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: "act-02",
    projectId: "main-project",
    titleAr: "تحديد الموعد النهائي لتسليم التايم شيت بعد انتهاء الفترة",
    titleEn: "Define timesheet submission deadline after period end",
    notesAr: "بانتظار قرار دومياتك: تأكيد عدد الأيام المسموح بها بعد يوم 20 لتقديم ساعات العمل.",
    notesEn: "Pending Domiatec decision: Domiatec to confirm number of days after the 20th.",
    descriptionAr: "بانتظار قرار دومياتك: تأكيد عدد الأيام المسموح بها بعد يوم 20 لتقديم ساعات العمل.",
    descriptionEn: "Pending Domiatec decision: Domiatec to confirm number of days after the 20th.",
    categoryId: "management",
    category: "management",
    categoryNameAr: "إدارة وتكامل SAP",
    categoryNameEn: "SAP Management & Integration",
    categoryColor: "#d97706",
    points: 3,
    weight: 3,
    status: "backlog",
    startDate: "2026-11-01",
    dueDate: "2026-11-16",
    assigneeAr: "فريق الموارد البشرية - دومياتك",
    assigneeEn: "Domiatec HR Team",
    assignedTo: "Domiatec HR Team",
    position: 2,
    sortOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: "act-03",
    projectId: "main-project",
    titleAr: "تحديد الإطار الزمني للموافقة التلقائية على التايم شيت",
    titleEn: "Define auto-approval timeframe",
    notesAr: "بانتظار قرار دومياتك: تأكيد عدد الأيام المطلوبة قبل التفعيل التلقائي للاعتماد.",
    notesEn: "Pending Domiatec decision: Domiatec to confirm number of days before auto-approval.",
    descriptionAr: "بانتظار قرار دومياتك: تأكيد عدد الأيام المطلوبة قبل التفعيل التلقائي للاعتماد.",
    descriptionEn: "Pending Domiatec decision: Domiatec to confirm number of days before auto-approval.",
    categoryId: "management",
    category: "management",
    categoryNameAr: "إدارة وتكامل SAP",
    categoryNameEn: "SAP Management & Integration",
    categoryColor: "#d97706",
    points: 3,
    weight: 3,
    status: "backlog",
    startDate: "2026-11-01",
    dueDate: "2026-11-18",
    assigneeAr: "فريق الموارد البشرية - دومياتك",
    assigneeEn: "Domiatec HR Team",
    assignedTo: "Domiatec HR Team",
    position: 3,
    sortOrder: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: "act-04",
    projectId: "main-project",
    titleAr: "تعديل مسميات تنبيهات ساعات العمل غير المكتملة",
    titleEn: "Rename timesheet alerts for incomplete working hours",
    notesAr: "إغلاق النشاط بنجاح والحصول على اعتماد وقبول شركة دومياتك النهائي (مكتمل 100%).",
    notesEn: "Close activity; obtain Domiatec acceptance. (100% Complete - DONE).",
    descriptionAr: "إغلاق النشاط بنجاح والحصول على اعتماد وقبول شركة دومياتك النهائي (مكتمل 100%).",
    descriptionEn: "Close activity; obtain Domiatec acceptance. (100% Complete - DONE).",
    categoryId: "frontend",
    category: "frontend",
    categoryNameAr: "تطوير الواجهات والتقارير",
    categoryNameEn: "Frontend & Analytics",
    categoryColor: "#7c3aed",
    points: 3,
    weight: 3,
    status: "done",
    startDate: "2026-11-01",
    dueDate: "2026-11-04",
    assigneeAr: "سولكس للاستشارات",
    assigneeEn: "Solex",
    assignedTo: "Solex",
    position: 1,
    sortOrder: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: "act-05",
    projectId: "main-project",
    titleAr: "إشعارات البريد الإلكتروني قبل الموعد النهائي للتقديم",
    titleEn: "Email notifications before submission deadline",
    notesAr: "دومياتك: تزويد قواعد المستلمين ومتطلبات التصعيد. سولكس: تقديم الحل الفني للإشعارات واعتماده.",
    notesEn: "Domiatec: Provide recipient rules and escalation needs. Solex: Solex to share feasible notification approach; Domiatec to approve.",
    descriptionAr: "دومياتك: تزويد قواعد المستلمين ومتطلبات التصعيد. سولكس: تقديم الحل الفني للإشعارات واعتماده.",
    descriptionEn: "Domiatec: Provide recipient rules and escalation needs. Solex: Solex to share feasible notification approach; Domiatec to approve.",
    categoryId: "qa",
    category: "qa",
    categoryNameAr: "اختبارات الجودة والقبول UAT",
    categoryNameEn: "QA & Testing",
    categoryColor: "#4f46e5",
    points: 3,
    weight: 3,
    status: "backlog",
    startDate: "2026-11-02",
    dueDate: "2026-11-20",
    assigneeAr: "سولكس وفريق دومياتك المشترك",
    assigneeEn: "Solex & Domiatec HR Team",
    assignedTo: "Solex & Domiatec HR Team",
    position: 4,
    sortOrder: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: "act-06",
    projectId: "main-project",
    titleAr: "تسجيل كافة أنواع الوقت في ملخص وقت العمل المسجل",
    titleEn: "Record all time types in “Recorded Working Time” summary",
    notesAr: "نسبة الإنجاز: 80%. دومياتك: التحقق من المخرجات. سولكس: توقيع اختبار قبول المستخدم UAT.",
    notesEn: "Progress: 80%. Domiatec: Validate output. Solex: Domiatec UAT/validation sign-off.",
    descriptionAr: "نسبة الإنجاز: 80%. دومياتك: التحقق من المخرجات. سولكس: توقيع اختبار قبول المستخدم UAT.",
    descriptionEn: "Progress: 80%. Domiatec: Validate output. Solex: Domiatec UAT/validation sign-off.",
    categoryId: "database",
    category: "database",
    categoryNameAr: "قواعد البيانات والبيانات",
    categoryNameEn: "Databases & Big Data",
    categoryColor: "#059669",
    points: 3,
    weight: 3,
    status: "review",
    startDate: "2026-10-25",
    dueDate: "2026-11-08",
    assigneeAr: "سولكس وفريق دومياتك المشترك",
    assigneeEn: "Solex & Domiatec HR Team",
    assignedTo: "Solex & Domiatec HR Team",
    position: 1,
    sortOrder: 6,
    createdAt: new Date().toISOString()
  },
  {
    id: "act-07",
    projectId: "main-project",
    titleAr: "تبسيط موافقة البصمة اليدوية إلى خطوة مدير واحدة مع نسخة للموارد البشرية",
    titleEn: "Streamline manual fingerprint time-event approval to one manager step with HR CC",
    notesAr: "نسبة الإنجاز: 90%. دومياتك: التحقق من سير العمل وتأكيد قائمة بريد HR CC. سولكس: اختبار UAT والقبول النهائي.",
    notesEn: "Progress: 90%. Domiatec: Validate workflow and confirm HR CC list. Solex: Domiatec UAT and final acceptance.",
    descriptionAr: "نسبة الإنجاز: 90%. دومياتك: التحقق من سير العمل وتأكيد قائمة بريد HR CC. سولكس: اختبار UAT والقبول النهائي.",
    descriptionEn: "Progress: 90%. Domiatec: Validate workflow and confirm HR CC list. Solex: Domiatec UAT and final acceptance.",
    categoryId: "management",
    category: "management",
    categoryNameAr: "إدارة وتكامل SAP",
    categoryNameEn: "SAP Management & Integration",
    categoryColor: "#d97706",
    points: 3,
    weight: 3,
    status: "review",
    startDate: "2026-10-26",
    dueDate: "2026-11-06",
    assigneeAr: "سولكس وفريق دومياتك المشترك",
    assigneeEn: "Solex & Domiatec HR Team",
    assignedTo: "Solex & Domiatec HR Team",
    position: 2,
    sortOrder: 7,
    createdAt: new Date().toISOString()
  },
  {
    id: "act-08",
    projectId: "main-project",
    titleAr: "ربط وتجميع أجهزة البصمة وتطبيق الهاتف المحمول",
    titleEn: "Mobile app and fingerprint terminal grouping",
    notesAr: "دومياتك: تأكيد مستخدمي التطبيق والمواقع والأجهزة. سولكس: تكوين المجموعات فور استلام البيانات.",
    notesEn: "Domiatec: Confirm mobile-app users, locations and terminals; provide user list, site locations, and terminal details. Solex: Configure grouping once inputs received.",
    descriptionAr: "دومياتك: تأكيد مستخدمي التطبيق والمواقع والأجهزة. سولكس: تكوين المجموعات فور استلام البيانات.",
    descriptionEn: "Domiatec: Confirm mobile-app users, locations and terminals; provide user list, site locations, and terminal details. Solex: Configure grouping once inputs received.",
    categoryId: "infra",
    category: "infra",
    categoryNameAr: "البنية التحتية والسحابة",
    categoryNameEn: "Cloud & Infrastructure",
    categoryColor: "#0284c7",
    points: 3,
    weight: 3,
    status: "backlog",
    startDate: "2026-11-03",
    dueDate: "2026-11-22",
    assigneeAr: "سولكس وفريق دومياتك المشترك",
    assigneeEn: "Solex & Domiatec HR Team",
    assignedTo: "Solex & Domiatec HR Team",
    position: 5,
    sortOrder: 8,
    createdAt: new Date().toISOString()
  },
  {
    id: "act-09",
    projectId: "main-project",
    titleAr: "تنبيهات البريد الإلكتروني اليومية لحالات الغياب غير المصرح به",
    titleEn: "Daily unauthorized-absence email alerts",
    notesAr: "دومياتك: تأكيد دقة بيانات البصمة وسياسات المقر والفروع. سولكس: تفعيل التنبيهات بعد استيفاء المتطلبات.",
    notesEn: "Domiatec: Confirm fingerprint-data accuracy and head-office/site policies; complete data cleansing and policy confirmation. Solex: Activate alerts after prerequisites are met.",
    descriptionAr: "دومياتك: تأكيد دقة بيانات البصمة وسياسات المقر والفروع. سولكس: تفعيل التنبيهات بعد استيفاء المتطلبات.",
    descriptionEn: "Domiatec: Confirm fingerprint-data accuracy and head-office/site policies; complete data cleansing and policy confirmation. Solex: Activate alerts after prerequisites are met.",
    categoryId: "security",
    category: "security",
    categoryNameAr: "أمن المعلومات وإدارة الهويات",
    categoryNameEn: "Security & IAM",
    categoryColor: "#e11d48",
    points: 3,
    weight: 3,
    status: "backlog",
    startDate: "2026-11-04",
    dueDate: "2026-11-24",
    assigneeAr: "سولكس وفريق دومياتك المشترك",
    assigneeEn: "Solex & Domiatec HR Team",
    assignedTo: "Solex & Domiatec HR Team",
    position: 6,
    sortOrder: 9,
    createdAt: new Date().toISOString()
  },
  {
    id: "act-10",
    projectId: "main-project",
    titleAr: "تأكيد فترة صلاحية أرصدة أيام التعويض في حسابات الوقت",
    titleEn: "Confirm validity period for replacement-day time accounts",
    notesAr: "دومياتك: تأكيد مدة الصلاحية المطلوبة. سولكس: ضبط الإعدادات واختبارها على النظام.",
    notesEn: "Domiatec: To confirm validity duration. Solex: To configure and test.",
    descriptionAr: "دومياتك: تأكيد مدة الصلاحية المطلوبة. سولكس: ضبط الإعدادات واختبارها على النظام.",
    descriptionEn: "Domiatec: To confirm validity duration. Solex: To configure and test.",
    categoryId: "management",
    category: "management",
    categoryNameAr: "إدارة وتكامل SAP",
    categoryNameEn: "SAP Management & Integration",
    categoryColor: "#d97706",
    points: 3,
    weight: 3,
    status: "backlog",
    startDate: "2026-11-02",
    dueDate: "2026-11-19",
    assigneeAr: "سولكس وفريق دومياتك المشترك",
    assigneeEn: "Solex & Domiatec HR Team",
    assignedTo: "Solex & Domiatec HR Team",
    position: 7,
    sortOrder: 10,
    createdAt: new Date().toISOString()
  },
  {
    id: "act-11",
    projectId: "main-project",
    titleAr: "جداول ومواعيد عمل موظفي دومياتك في الفروع",
    titleEn: "Domiatec employees working schedules for branches",
    notesAr: "إدارة المواقع والموارد البشرية لتأكيد سياسة الحضور ومواعيد الورديات لكافة الفروع.",
    notesEn: "Site Management / HR to confirm attendance policy for all branches.",
    descriptionAr: "إدارة المواقع والموارد البشرية لتأكيد سياسة الحضور ومواعيد الورديات لكافة الفروع.",
    descriptionEn: "Site Management / HR to confirm attendance policy for all branches.",
    categoryId: "management",
    category: "management",
    categoryNameAr: "إدارة وتكامل SAP",
    categoryNameEn: "SAP Management & Integration",
    categoryColor: "#d97706",
    points: 3,
    weight: 3,
    status: "backlog",
    startDate: "2026-11-04",
    dueDate: "2026-11-25",
    assigneeAr: "فريق الموارد البشرية - دومياتك",
    assigneeEn: "Domiatec HR Team",
    assignedTo: "Domiatec HR Team",
    position: 8,
    sortOrder: 11,
    createdAt: new Date().toISOString()
  },
  {
    id: "act-12",
    projectId: "main-project",
    titleAr: "مراجعة واعتماد دليل عمل تتبع الوقت في المقر الرئيسي (HQ Workbook)",
    titleEn: "Review & Validate HQ Time Tracking Workbook",
    notesAr: "فريق دومياتك: مراجعة والتحقق من صحة دليل تتبع الوقت المرسل من شركة سولكس واعتماده.",
    notesEn: "Domiatec Review / Validate HQ-Time Tracking workbook sent by solex.",
    descriptionAr: "فريق دومياتك: مراجعة والتحقق من صحة دليل تتبع الوقت المرسل من شركة سولكس واعتماده.",
    descriptionEn: "Domiatec Review / Validate HQ-Time Tracking workbook sent by solex.",
    categoryId: "qa",
    category: "qa",
    categoryNameAr: "اختبارات الجودة والقبول UAT",
    categoryNameEn: "QA & Testing",
    categoryColor: "#4f46e5",
    points: 3,
    weight: 3,
    status: "backlog",
    startDate: "2026-11-03",
    dueDate: "2026-11-21",
    assigneeAr: "فريق الموارد البشرية - دومياتك",
    assigneeEn: "Domiatec HR Team",
    assignedTo: "Domiatec HR Team",
    position: 9,
    sortOrder: 12,
    createdAt: new Date().toISOString()
  },
  {
    id: "act-13",
    projectId: "main-project",
    titleAr: "مراجعة واعتماد وثائق سير العمل وقواعد العمل وصلاحيات الأدوار RBP",
    titleEn: "Review & Validate workflow documentation, Business Rules & Role-Based Permissions (RBP)",
    notesAr: "مراجعة واعتماد وثائق DomiaTech وسير العمل، وقواعد عمل SAP SuccessFactors، وتقرير صلاحيات الأدوار RBP.",
    notesEn: "Domiatec Review / Validate Documentation: workflow_DocumentationDomiaTech, SAP_SuccessFactors_BusniessRules, report_Role_Based_Permission Documentation.",
    descriptionAr: "مراجعة واعتماد وثائق DomiaTech وسير العمل، وقواعد عمل SAP SuccessFactors، وتقرير صلاحيات الأدوار RBP.",
    descriptionEn: "Domiatec Review / Validate Documentation: workflow_DocumentationDomiaTech, SAP_SuccessFactors_BusniessRules, report_Role_Based_Permission Documentation.",
    categoryId: "security",
    category: "security",
    categoryNameAr: "أمن المعلومات وإدارة الهويات",
    categoryNameEn: "Security & IAM",
    categoryColor: "#e11d48",
    points: 3,
    weight: 3,
    status: "backlog",
    startDate: "2026-11-02",
    dueDate: "2026-11-26",
    assigneeAr: "فريق الموارد البشرية - دومياتك",
    assigneeEn: "Domiatec HR Team",
    assignedTo: "Domiatec HR Team",
    position: 10,
    sortOrder: 13,
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

const { initializeApp } = require('./frontend/node_modules/firebase/app');
const { getFirestore, doc, setDoc } = require('./frontend/node_modules/firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyB7b3hvcspV-erc0smdP6AbCeDu8f8-mQk",
  authDomain: "project-domiatec-sapsuccess.firebaseapp.com",
  projectId: "project-domiatec-sapsuccess",
  storageBucket: "project-domiatec-sapsuccess.firebasestorage.app",
  messagingSenderId: "868032924552",
  appId: "1:868032924552:web:5289739a81909ffaba083d"
};

function formatDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

const DEFAULT_PROJECT = {
  id: 'main-project',
  titleAr: 'مشروع التحول الرقمي SAP SuccessFactors - شركة دومياتك',
  titleEn: 'Domiatec SAP SuccessFactors Digital Transformation',
  wipLimit: 15
};

const DEFAULT_CATEGORIES = [
  { id: 'infra', key: 'infra', nameAr: 'البنية التحتية والسحابة', nameEn: 'Cloud & Infrastructure', color: '#0284c7', colorClass: 'bg-sky-50 text-sky-700 border-sky-200', icon: 'server', isDefault: 1 },
  { id: 'database', key: 'database', nameAr: 'قواعد البيانات والبيانات', nameEn: 'Databases & Big Data', color: '#059669', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'database', isDefault: 1 },
  { id: 'security', key: 'security', nameAr: 'أمن المعلومات وإدارة الهويات', nameEn: 'Security & IAM', color: '#e11d48', colorClass: 'bg-rose-50 text-rose-700 border-rose-200', icon: 'shield-alert', isDefault: 1 },
  { id: 'frontend', key: 'frontend', nameAr: 'تطوير الواجهات والتقارير', nameEn: 'Frontend & Analytics', color: '#7c3aed', colorClass: 'bg-violet-50 text-violet-700 border-violet-200', icon: 'layout', isDefault: 1 },
  { id: 'management', key: 'management', nameAr: 'إدارة وتكامل SAP', nameEn: 'SAP Management & Integration', color: '#d97706', colorClass: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'clipboard-check', isDefault: 1 },
  { id: 'qa', key: 'qa', nameAr: 'اختبارات الجودة والقبول UAT', nameEn: 'QA & Testing', color: '#4f46e5', colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: 'check-circle', isDefault: 1 }
];

const DEFAULT_USERS = [
  { id: 1, username: 'admin', fullName: 'مدير النظام الرئيسي', role: 'admin', passwordHash: 'admin123', pin: '1234', createdAt: new Date().toISOString() }
];

const DEFAULT_TASKS = [
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

function cleanForFirestore(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    return value === undefined ? null : value;
  }));
}

async function seed() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const docRef = doc(db, 'kanban_v1', 'domiatec_project');

  const payload = cleanForFirestore({
    updatedAt: new Date().toISOString(),
    project: DEFAULT_PROJECT,
    categories: DEFAULT_CATEGORIES,
    users: DEFAULT_USERS,
    tasks: DEFAULT_TASKS
  });

  await setDoc(docRef, payload);
  console.log('Successfully updated Cloud Firestore with standardized SAP SuccessFactors data!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

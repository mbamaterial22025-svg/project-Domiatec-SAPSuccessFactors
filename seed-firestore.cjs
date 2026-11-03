const { initializeApp } = require('./frontend/node_modules/firebase/app');
const { getFirestore, doc, setDoc, getDoc } = require('./frontend/node_modules/firebase/firestore');

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
  { id: 1, username: 'admin', fullName: 'مدير النظام', role: 'admin', passwordHash: 'admin123', pin: '1234', createdAt: new Date().toISOString() }
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

async function seed() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const docRef = doc(db, 'kanban_v1', 'domiatec_project');

  const snap = await getDoc(docRef);
  if (snap.exists() && snap.data().tasks && snap.data().tasks.length > 0) {
    console.log('Firestore already has data! Skipping overwrite to protect user data.');
    process.exit(0);
  }

  const payload = {
    updatedAt: new Date().toISOString(),
    project: DEFAULT_PROJECT,
    categories: DEFAULT_CATEGORIES,
    users: DEFAULT_USERS,
    tasks: DEFAULT_TASKS
  };

  await setDoc(docRef, payload);
  console.log('Successfully seeded Cloud Firestore with official SAP SuccessFactors data!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});


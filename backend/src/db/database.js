const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'kanban.db');
let dbInstance = null;

function getDb() {
    if (!dbInstance) {
        dbInstance = new DatabaseSync(DB_PATH);
        dbInstance.exec('PRAGMA foreign_keys = ON;');
        initDatabase(dbInstance);
    }
    return dbInstance;
}

function formatDateOffset(offsetDays) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function initDatabase(db) {
    // 1. Run Schema
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    db.exec(schemaSql);

    // 2. Run Seed for Project & Categories
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    db.exec(seedSql);

    // Ensure pin column exists in users
    try {
        db.exec('ALTER TABLE users ADD COLUMN pin TEXT;');
    } catch (e) {}

    // 3. Seed initial 8 tasks if tasks table is empty
    const countRow = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
    if (countRow.count === 0) {
        seedInitialTasks(db);
    }

    // 4. Seed default admin user if users table is empty
    seedDefaultAdmin(db);
}

function seedDefaultAdmin(db) {
    const crypto = require('crypto');
    const count = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
    if (count === 0) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync('admin123', salt, 10000, 64, 'sha512').toString('hex');
        db.prepare(`
            INSERT INTO users (id, username, password_hash, full_name, role)
            VALUES ('usr-admin', 'admin', ?, 'مدير النظام الرئيسي', 'admin')
        `).run(`${salt}:${hash}`);
        console.log('✓ Default Admin User created in DB: username="admin", password="admin123"');
    }
}

function seedInitialTasks(db) {
    const defaultTasks = [
        {
            id: 't-101',
            projectId: 'main-project',
            titleAr: 'إعداد البنية السحابية وخوادم الإنتاج',
            titleEn: 'Cloud Infrastructure & Production Servers Setup',
            categoryId: 'infra',
            points: 8,
            startDate: formatDateOffset(-10),
            dueDate: formatDateOffset(-4),
            assigneeAr: 'م. كريم عادل',
            assigneeEn: 'Eng. Karim Adel',
            status: 'done',
            notesAr: 'تم رفع الخوادم وضبط جدار الحماية بنجاح',
            notesEn: 'Servers deployed and firewall configured successfully',
            position: 1
        },
        {
            id: 't-102',
            projectId: 'main-project',
            titleAr: 'تصميم هيكل قاعدة البيانات الموحدة',
            titleEn: 'Unified Database Schema Design',
            categoryId: 'database',
            points: 5,
            startDate: formatDateOffset(-8),
            dueDate: formatDateOffset(-3),
            assigneeAr: 'م. سارة محمود',
            assigneeEn: 'Eng. Sara Mahmoud',
            status: 'done',
            notesAr: 'مراجعة الجداول والعلاقات الأساسية',
            notesEn: 'Core tables and relationships reviewed',
            position: 2
        },
        {
            id: 't-103',
            projectId: 'main-project',
            titleAr: 'تطوير نظام تسجيل الدخول والصلاحيات (JWT)',
            titleEn: 'Auth & RBAC System Development (JWT)',
            categoryId: 'security',
            points: 8,
            startDate: formatDateOffset(-5),
            dueDate: formatDateOffset(-1), // Overdue
            assigneeAr: 'م. أحمد طارق',
            assigneeEn: 'Eng. Ahmed Tarek',
            status: 'inprogress',
            notesAr: 'يتبقى ربط التحقق الثنائي 2FA',
            notesEn: 'Pending 2FA integration',
            position: 3
        },
        {
            id: 't-104',
            projectId: 'main-project',
            titleAr: 'بناء لوحة المؤشرات والتقارير التفاعلية',
            titleEn: 'Interactive KPI & Reporting Dashboard',
            categoryId: 'frontend',
            points: 5,
            startDate: formatDateOffset(-3),
            dueDate: formatDateOffset(2), // Due Soon
            assigneeAr: 'م. منى الشاذلي',
            assigneeEn: 'Eng. Mona El-Shazly',
            status: 'inprogress',
            notesAr: 'ربط الرسوم البيانية مع نقاط المشروع',
            notesEn: 'Binding charts with project points',
            position: 4
        },
        {
            id: 't-105',
            projectId: 'main-project',
            titleAr: 'مراجعة ثغرات أمنية واختبار الاختراق الأولي',
            titleEn: 'Vulnerability Audit & Initial Penetration Test',
            categoryId: 'security',
            points: 3,
            startDate: formatDateOffset(-4),
            dueDate: formatDateOffset(1), // Due Soon
            assigneeAr: 'م. كريم عادل',
            assigneeEn: 'Eng. Karim Adel',
            status: 'review',
            notesAr: 'في انتظار اعتماد تقرير الفحص الأمني',
            notesEn: 'Awaiting security scan report sign-off',
            position: 5
        },
        {
            id: 't-106',
            projectId: 'main-project',
            titleAr: 'تحسين سرعة استجابة الاستعلامات (Caching)',
            titleEn: 'Query Response Time Optimization (Caching)',
            categoryId: 'database',
            points: 3,
            startDate: formatDateOffset(-2),
            dueDate: formatDateOffset(5), // On track
            assigneeAr: 'م. سارة محمود',
            assigneeEn: 'Eng. Sara Mahmoud',
            status: 'inprogress',
            notesAr: 'استخدام Redis لتخزين الجلسات',
            notesEn: 'Using Redis for session caching',
            position: 6
        },
        {
            id: 't-107',
            projectId: 'main-project',
            titleAr: 'توثيق واجهات البرمجة (API Documentation)',
            titleEn: 'API Documentation (Swagger/OpenAPI)',
            categoryId: 'management',
            points: 2,
            startDate: formatDateOffset(1),
            dueDate: formatDateOffset(7),
            assigneeAr: 'م. أحمد طارق',
            assigneeEn: 'Eng. Ahmed Tarek',
            status: 'backlog',
            notesAr: 'تجهيز ملفات Swagger للفريق',
            notesEn: 'Preparing Swagger specs for the team',
            position: 7
        },
        {
            id: 't-108',
            projectId: 'main-project',
            titleAr: 'اختبارات الأداء والضغط الشامل قبل الإطلاق',
            titleEn: 'Comprehensive Pre-Launch Load & Stress Testing',
            categoryId: 'qa',
            points: 13,
            startDate: formatDateOffset(3),
            dueDate: formatDateOffset(12),
            assigneeAr: 'م. منى الشاذلي',
            assigneeEn: 'Eng. Mona El-Shazly',
            status: 'backlog',
            notesAr: 'محاكاة 10,000 مستخدم متزامن',
            notesEn: 'Simulating 10,000 concurrent users',
            position: 8
        }
    ];

    const insertStmt = db.prepare(`
        INSERT INTO tasks (
            id, project_id, title_ar, title_en, category_id, points,
            start_date, due_date, assignee_ar, assignee_en, status,
            notes_ar, notes_en, position
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const t of defaultTasks) {
        insertStmt.run(
            t.id, t.projectId, t.titleAr, t.titleEn, t.categoryId, t.points,
            t.startDate, t.dueDate, t.assigneeAr, t.assigneeEn, t.status,
            t.notesAr, t.notesEn, t.position
        );
    }
}

// Database helper functions
const db = {
    getDb,
    query(sql, params = []) {
        const stmt = getDb().prepare(sql);
        return stmt.all(...params);
    },
    get(sql, params = []) {
        const stmt = getDb().prepare(sql);
        return stmt.get(...params);
    },
    run(sql, params = []) {
        const stmt = getDb().prepare(sql);
        return stmt.run(...params);
    },
    exec(sql) {
        return getDb().exec(sql);
    },
    resetDefaults() {
        const database = getDb();
        database.exec('DELETE FROM activity_logs;');
        database.exec('DELETE FROM tasks;');
        database.exec(`
            UPDATE projects 
            SET title_ar = 'مشروع تطوير المنصة الرقمية 2026',
                title_en = 'Digital Platform Development Project 2026',
                wip_limit = 15,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = 'main-project';
        `);
        seedInitialTasks(database);
    }
};

module.exports = db;


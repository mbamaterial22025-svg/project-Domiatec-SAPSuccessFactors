-- ====================================================================
-- Initial Seed Data: Weighted Kanban & Timeline Tracker
-- ====================================================================

-- 1. Default Project
INSERT OR REPLACE INTO projects (id, title_ar, title_en, wip_limit, admin_pin)
VALUES (
    'main-project',
    'مشروع تطوير المنصة الرقمية 2026',
    'Digital Platform Development Project 2026',
    15,
    '1234'
);

-- 2. Standard Workstream Categories
INSERT OR REPLACE INTO categories (id, name_ar, name_en, color_class, icon, display_order) VALUES
('infra', 'البنية التحتية', 'Infrastructure', 'bg-sky-50 text-sky-700 border-sky-200', 'server', 1),
('database', 'قواعد البيانات', 'Databases', 'bg-emerald-50 text-emerald-700 border-emerald-200', 'database', 2),
('security', 'أمن المعلومات', 'Information Security', 'bg-rose-50 text-rose-700 border-rose-200', 'shield-alert', 3),
('frontend', 'تطوير الواجهات', 'Frontend Dev', 'bg-violet-50 text-violet-700 border-violet-200', 'layout', 4),
('management', 'إدارة وتحليل', 'Management & Analysis', 'bg-amber-50 text-amber-700 border-amber-200', 'clipboard-check', 5),
('qa', 'اختبار وجودة', 'QA & Testing', 'bg-indigo-50 text-indigo-700 border-indigo-200', 'check-circle', 6);


const TaskModel = require('../models/TaskModel');
const ProjectModel = require('../models/ProjectModel');
const MetricsService = require('./MetricsService');

class ExportService {
    static generateCSV(lang = 'ar') {
        const isEn = lang === 'en';
        const tasks = TaskModel.getAllTasks();

        const headers = isEn
            ? ['ID', 'Activity Title', 'Category', 'Points', 'Status', 'Assignee', 'Start Date', 'Due Date', 'Deadline Status', 'Notes']
            : ['الرقم', 'اسم النشاط', 'الفئة', 'النقاط', 'الحالة', 'المسؤول', 'تاريخ البدء', 'تاريخ الاستحقاق', 'حالة الموعد', 'ملاحظات'];

        const statusMap = {
            'backlog': isEn ? 'Backlog' : 'قائمة الانتظار',
            'inprogress': isEn ? 'In Progress' : 'قيد التنفيذ',
            'review': isEn ? 'In Review' : 'قيد المراجعة',
            'done': isEn ? 'Done' : 'مكتمل'
        };

        const rows = tasks.map(t => {
            const dl = MetricsService.getDeadlineStatus(t);
            const title = isEn ? (t.titleEn || t.titleAr) : (t.titleAr || t.titleEn);
            const category = isEn ? (t.categoryNameEn || t.categoryId) : (t.categoryNameAr || t.categoryId);
            const assignee = isEn ? (t.assigneeEn || t.assigneeAr) : (t.assigneeAr || t.assigneeEn);
            const notes = isEn ? (t.notesEn || t.notesAr || '') : (t.notesAr || t.notesEn || '');
            const dlLabel = isEn ? dl.labelEn : dl.labelAr;
            const statusLabel = statusMap[t.status] || t.status;

            const escapeCsv = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

            return [
                escapeCsv(t.id),
                escapeCsv(title),
                escapeCsv(category),
                t.points,
                escapeCsv(statusLabel),
                escapeCsv(assignee),
                t.startDate,
                t.dueDate,
                escapeCsv(dlLabel),
                escapeCsv(notes)
            ].join(',');
        });

        // Prepend UTF-8 BOM (\uFEFF) for Microsoft Excel Arabic support
        return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    }

    static exportJSONBackup() {
        const project = ProjectModel.getProject();
        const tasks = TaskModel.getAllTasks();

        return {
            metadata: {
                version: '1.0.0',
                appName: 'Weighted Kanban & Timeline Tracker',
                exportedAt: new Date().toISOString()
            },
            project: {
                titleAr: project.titleAr,
                titleEn: project.titleEn,
                wipLimit: project.wipLimit
            },
            tasks: tasks.map(t => ({
                id: t.id,
                titleAr: t.titleAr,
                titleEn: t.titleEn,
                categoryId: t.categoryId,
                points: t.points,
                startDate: t.startDate,
                dueDate: t.dueDate,
                assigneeAr: t.assigneeAr,
                assigneeEn: t.assigneeEn,
                status: t.status,
                notesAr: t.notesAr,
                notesEn: t.notesEn,
                position: t.position
            }))
        };
    }

    static importJSONBackup(data) {
        if (!data || !Array.isArray(data.tasks)) {
            throw new Error('الملف غير صالح: يجب أن يحتوي ملف JSON على مصفوفة أنشطة tasks.');
        }

        if (data.project) {
            ProjectModel.updateProject('main-project', {
                titleAr: data.project.titleAr,
                titleEn: data.project.titleEn,
                wipLimit: data.project.wipLimit
            });
        }

        TaskModel.replaceAllTasks(data.tasks);
        return { success: true, count: data.tasks.length };
    }
}

module.exports = ExportService;


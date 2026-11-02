const TaskModel = require('../models/TaskModel');
const ProjectModel = require('../models/ProjectModel');
const CategoryModel = require('../models/CategoryModel');

class MetricsService {
    static getDeadlineStatus(task) {
        if (task.status === 'done') {
            return { code: 'done', labelAr: 'مكتمل ✓', labelEn: 'Completed ✓', daysDiff: 0 };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(task.dueDate + 'T00:00:00');
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            const late = Math.abs(diffDays);
            return {
                code: 'overdue',
                daysDiff: diffDays,
                labelAr: `متأخر منذ ${late} ${late === 1 ? 'يوم' : 'أيام'}`,
                labelEn: `Overdue by ${late} ${late === 1 ? 'day' : 'days'}`
            };
        } else if (diffDays === 0) {
            return {
                code: 'soon',
                daysDiff: 0,
                labelAr: 'يستحق اليوم!',
                labelEn: 'Due Today!'
            };
        } else if (diffDays <= 3) {
            return {
                code: 'soon',
                daysDiff: diffDays,
                labelAr: `باقي ${diffDays} ${diffDays === 1 ? 'يوم' : 'أيام'}`,
                labelEn: `${diffDays} ${diffDays === 1 ? 'day' : 'days'} left`
            };
        } else {
            return {
                code: 'ontrack',
                daysDiff: diffDays,
                labelAr: `باقي ${diffDays} يوم`,
                labelEn: `${diffDays} days left`
            };
        }
    }

    static calculateProjectMetrics(projectId = 'main-project') {
        const project = ProjectModel.getProject(projectId);
        const tasks = TaskModel.getAllTasks({ projectId });
        const categories = CategoryModel.getAllCategories();

        let totalPoints = 0;
        let donePoints = 0;
        let reviewPoints = 0;
        let inProgressPoints = 0;
        let backlogPoints = 0;

        let overdueCount = 0;
        let overduePoints = 0;
        let dueSoonCount = 0;
        let dueSoonPoints = 0;

        const assigneeMap = {};

        tasks.forEach(task => {
            const pts = Number(task.points) || 0;
            totalPoints += pts;

            if (task.status === 'done') donePoints += pts;
            else if (task.status === 'review') reviewPoints += pts;
            else if (task.status === 'inprogress') inProgressPoints += pts;
            else backlogPoints += pts;

            const dl = this.getDeadlineStatus(task);
            if (dl.code === 'overdue') {
                overdueCount++;
                overduePoints += pts;
            } else if (dl.code === 'soon') {
                dueSoonCount++;
                dueSoonPoints += pts;
            }

            // Assignee workload
            const nameAr = (task.assigneeAr || '').trim() || 'غير محدد';
            const nameEn = (task.assigneeEn || '').trim() || nameAr;
            const key = nameAr;

            if (!assigneeMap[key]) {
                assigneeMap[key] = {
                    nameAr,
                    nameEn,
                    totalPoints: 0,
                    donePoints: 0,
                    inProgressPoints: 0,
                    taskCount: 0
                };
            }
            assigneeMap[key].totalPoints += pts;
            assigneeMap[key].taskCount += 1;
            if (task.status === 'done') assigneeMap[key].donePoints += pts;
            if (task.status === 'inprogress') assigneeMap[key].inProgressPoints += pts;
        });

        const wipLimit = project ? project.wipLimit : 15;
        let wipStatus = 'safe';
        if (inProgressPoints > wipLimit) {
            wipStatus = 'exceeded';
        } else if (inProgressPoints >= wipLimit * 0.85) {
            wipStatus = 'warning';
        }

        const weightedPercent = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;
        const reviewPercent = totalPoints > 0 ? Number(((reviewPoints / totalPoints) * 100).toFixed(1)) : 0;
        const inProgressPercent = totalPoints > 0 ? Number(((inProgressPoints / totalPoints) * 100).toFixed(1)) : 0;

        // Category breakdown
        const categoryBreakdown = categories.map(cat => {
            const catTasks = tasks.filter(t => t.categoryId === cat.id);
            const catTotal = catTasks.reduce((acc, t) => acc + (Number(t.points) || 0), 0);
            const catDone = catTasks.filter(t => t.status === 'done').reduce((acc, t) => acc + (Number(t.points) || 0), 0);
            const pct = catTotal > 0 ? Math.round((catDone / catTotal) * 100) : 0;

            return {
                id: cat.id,
                nameAr: cat.nameAr,
                nameEn: cat.nameEn,
                colorClass: cat.colorClass,
                icon: cat.icon,
                totalPoints: catTotal,
                donePoints: catDone,
                taskCount: catTasks.length,
                completionPercent: pct
            };
        }).filter(c => c.taskCount > 0);

        // Assignee breakdown list
        const assigneeBreakdown = Object.values(assigneeMap).map(a => ({
            ...a,
            completionPercent: a.totalPoints > 0 ? Math.round((a.donePoints / a.totalPoints) * 100) : 0
        }));

        return {
            totalPoints,
            totalTasks: tasks.length,
            donePoints,
            reviewPoints,
            inProgressPoints,
            backlogPoints,
            weightedPercent,
            reviewPercent,
            inProgressPercent,
            wipLimit,
            wipStatus,
            wipExceededBy: Math.max(0, inProgressPoints - wipLimit),
            overdueCount,
            overduePoints,
            dueSoonCount,
            dueSoonPoints,
            categoryBreakdown,
            assigneeBreakdown
        };
    }
}

module.exports = MetricsService;

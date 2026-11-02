const db = require('../db/database');
const ActivityLogModel = require('./ActivityLogModel');

class TaskModel {
    static getAllTasks({ search, category, assignee, status, projectId = 'main-project' } = {}) {
        let sql = `
            SELECT t.id, t.project_id AS projectId, t.title_ar AS titleAr, t.title_en AS titleEn,
                   t.category_id AS categoryId, t.points, t.start_date AS startDate, t.due_date AS dueDate,
                   t.assignee_ar AS assigneeAr, t.assignee_en AS assigneeEn, t.status,
                   t.notes_ar AS notesAr, t.notes_en AS notesEn, t.position,
                   t.created_at AS createdAt, t.updated_at AS updatedAt,
                   c.name_ar AS categoryNameAr, c.name_en AS categoryNameEn, c.color_class AS categoryColor
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.project_id = ?
        `;
        const params = [projectId];

        if (category && category !== 'all') {
            sql += ` AND t.category_id = ?`;
            params.push(category);
        }

        if (status && status !== 'all') {
            sql += ` AND t.status = ?`;
            params.push(status);
        }

        if (assignee && assignee !== 'all') {
            sql += ` AND (t.assignee_ar = ? OR t.assignee_en = ?)`;
            params.push(assignee, assignee);
        }

        if (search && search.trim()) {
            const query = `%${search.trim().toLowerCase()}%`;
            sql += ` AND (
                LOWER(t.title_ar) LIKE ? OR
                LOWER(t.title_en) LIKE ? OR
                LOWER(t.assignee_ar) LIKE ? OR
                LOWER(t.assignee_en) LIKE ? OR
                LOWER(t.notes_ar) LIKE ? OR
                LOWER(t.notes_en) LIKE ?
            )`;
            params.push(query, query, query, query, query, query);
        }

        sql += ` ORDER BY t.position ASC, t.created_at DESC`;

        return db.query(sql, params);
    }

    static getTaskById(id) {
        return db.get(`
            SELECT t.id, t.project_id AS projectId, t.title_ar AS titleAr, t.title_en AS titleEn,
                   t.category_id AS categoryId, t.points, t.start_date AS startDate, t.due_date AS dueDate,
                   t.assignee_ar AS assigneeAr, t.assignee_en AS assigneeEn, t.status,
                   t.notes_ar AS notesAr, t.notes_en AS notesEn, t.position,
                   t.created_at AS createdAt, t.updated_at AS updatedAt,
                   c.name_ar AS categoryNameAr, c.name_en AS categoryNameEn, c.color_class AS categoryColor
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.id = ?
        `, [id]);
    }

    static createTask(data) {
        const id = data.id || ('t-' + Date.now());
        const projectId = data.projectId || 'main-project';
        const points = Number(data.points) || 1;
        const position = Number(data.position) || 0;

        db.run(`
            INSERT INTO tasks (
                id, project_id, title_ar, title_en, category_id, points,
                start_date, due_date, assignee_ar, assignee_en, status,
                notes_ar, notes_en, position
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id,
            projectId,
            data.titleAr,
            data.titleEn || data.titleAr,
            data.categoryId,
            points,
            data.startDate,
            data.dueDate,
            data.assigneeAr,
            data.assigneeEn || data.assigneeAr,
            data.status || 'backlog',
            data.notesAr || '',
            data.notesEn || '',
            position
        ]);

        ActivityLogModel.log(id, 'created', { titleAr: data.titleAr, points, status: data.status });
        return this.getTaskById(id);
    }

    static updateTask(id, data) {
        const existing = this.getTaskById(id);
        if (!existing) return null;

        const titleAr = data.titleAr !== undefined ? data.titleAr : existing.titleAr;
        const titleEn = data.titleEn !== undefined ? data.titleEn : existing.titleEn;
        const categoryId = data.categoryId !== undefined ? data.categoryId : existing.categoryId;
        const points = data.points !== undefined ? Number(data.points) : existing.points;
        const startDate = data.startDate !== undefined ? data.startDate : existing.startDate;
        const dueDate = data.dueDate !== undefined ? data.dueDate : existing.dueDate;
        const assigneeAr = data.assigneeAr !== undefined ? data.assigneeAr : existing.assigneeAr;
        const assigneeEn = data.assigneeEn !== undefined ? data.assigneeEn : existing.assigneeEn;
        const status = data.status !== undefined ? data.status : existing.status;
        const notesAr = data.notesAr !== undefined ? data.notesAr : existing.notesAr;
        const notesEn = data.notesEn !== undefined ? data.notesEn : existing.notesEn;
        const position = data.position !== undefined ? Number(data.position) : existing.position;

        db.run(`
            UPDATE tasks
            SET title_ar = ?, title_en = ?, category_id = ?, points = ?,
                start_date = ?, due_date = ?, assignee_ar = ?, assignee_en = ?,
                status = ?, notes_ar = ?, notes_en = ?, position = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            titleAr, titleEn, categoryId, points,
            startDate, dueDate, assigneeAr, assigneeEn,
            status, notesAr, notesEn, position,
            id
        ]);

        ActivityLogModel.log(id, 'updated', { titleAr, points, status });
        return this.getTaskById(id);
    }

    static updateStatus(id, newStatus) {
        const existing = this.getTaskById(id);
        if (!existing) return null;

        db.run(`
            UPDATE tasks
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [newStatus, id]);

        ActivityLogModel.log(id, 'status_changed', { from: existing.status, to: newStatus });
        return this.getTaskById(id);
    }

    static deleteTask(id) {
        const existing = this.getTaskById(id);
        if (!existing) return false;

        db.run(`DELETE FROM tasks WHERE id = ?`, [id]);
        ActivityLogModel.log(id, 'deleted', { titleAr: existing.titleAr });
        return true;
    }

    static replaceAllTasks(tasksList) {
        db.run('DELETE FROM tasks WHERE project_id = ?', ['main-project']);
        for (const t of tasksList) {
            this.createTask({ ...t, projectId: 'main-project' });
        }
        ActivityLogModel.log('bulk', 'import_json', { count: tasksList.length });
    }
}

module.exports = TaskModel;


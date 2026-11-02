const db = require('../db/database');

class ActivityLogModel {
    static log(taskId, action, details = null) {
        try {
            const detailsStr = typeof details === 'object' ? JSON.stringify(details) : String(details || '');
            db.run(`
                INSERT INTO activity_logs (task_id, action, details)
                VALUES (?, ?, ?)
            `, [taskId, action, detailsStr]);
        } catch (e) {
            console.error('Failed to write activity log:', e);
        }
    }

    static getRecent(limit = 50) {
        return db.query(`
            SELECT id, task_id AS taskId, action, details, created_at AS createdAt
            FROM activity_logs
            ORDER BY id DESC
            LIMIT ?
        `, [limit]);
    }
}

module.exports = ActivityLogModel;


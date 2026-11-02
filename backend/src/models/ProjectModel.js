const db = require('../db/database');

class ProjectModel {
    static getProject(id = 'main-project') {
        const row = db.get(`
            SELECT id, title_ar AS titleAr, title_en AS titleEn,
                   wip_limit AS wipLimit, admin_pin AS adminPin,
                   created_at AS createdAt, updated_at AS updatedAt
            FROM projects
            WHERE id = ?
        `, [id]);
        return row;
    }

    static updateProject(id = 'main-project', { titleAr, titleEn, wipLimit, adminPin }) {
        const current = this.getProject(id);
        if (!current) return null;

        const newTitleAr = titleAr !== undefined ? titleAr : current.titleAr;
        const newTitleEn = titleEn !== undefined ? titleEn : current.titleEn;
        const newWipLimit = wipLimit !== undefined ? Number(wipLimit) : current.wipLimit;
        const newAdminPin = adminPin !== undefined ? String(adminPin).trim() : current.adminPin;

        db.run(`
            UPDATE projects
            SET title_ar = ?, title_en = ?, wip_limit = ?, admin_pin = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [newTitleAr, newTitleEn, newWipLimit, newAdminPin, id]);

        return this.getProject(id);
    }

    static verifyPin(id = 'main-project', pin) {
        const project = this.getProject(id);
        if (!project) return false;
        return String(project.adminPin).trim() === String(pin).trim();
    }
}

module.exports = ProjectModel;


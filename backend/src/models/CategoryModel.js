const db = require('../db/database');

class CategoryModel {
    static getAllCategories() {
        return db.query(`
            SELECT id, name_ar AS nameAr, name_en AS nameEn,
                   color_class AS colorClass, icon, display_order AS displayOrder
            FROM categories
            ORDER BY display_order ASC
        `);
    }

    static getCategoryById(id) {
        return db.get(`
            SELECT id, name_ar AS nameAr, name_en AS nameEn,
                   color_class AS colorClass, icon, display_order AS displayOrder
            FROM categories
            WHERE id = ?
        `, [id]);
    }

    static createCategory({ id, nameAr, nameEn, colorClass, icon, displayOrder }) {
        if (!nameAr || !nameAr.trim()) {
            throw new Error('اسم الفئة بالعربية مطلوب.');
        }

        const catId = id ? id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') : ('cat-' + Date.now());
        const existing = this.getCategoryById(catId);
        if (existing) {
            throw new Error(`معرف الفئة '${catId}' موجود بالفعل.`);
        }

        const order = displayOrder !== undefined ? Number(displayOrder) : 10;
        const color = colorClass || 'bg-slate-50 text-slate-700 border-slate-200';
        const ic = icon || 'tag';

        db.run(`
            INSERT INTO categories (id, name_ar, name_en, color_class, icon, display_order)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [catId, nameAr.trim(), (nameEn || nameAr).trim(), color, ic, order]);

        return this.getCategoryById(catId);
    }

    static updateCategory(id, { nameAr, nameEn, colorClass, icon, displayOrder }) {
        const existing = this.getCategoryById(id);
        if (!existing) {
            throw new Error('الفئة غير موجودة للتعديل.');
        }

        const newNameAr = nameAr !== undefined ? nameAr.trim() : existing.nameAr;
        const newNameEn = nameEn !== undefined ? nameEn.trim() : existing.nameEn;
        const newColor = colorClass !== undefined ? colorClass : existing.colorClass;
        const newIcon = icon !== undefined ? icon : existing.icon;
        const newOrder = displayOrder !== undefined ? Number(displayOrder) : existing.displayOrder;

        db.run(`
            UPDATE categories
            SET name_ar = ?, name_en = ?, color_class = ?, icon = ?, display_order = ?
            WHERE id = ?
        `, [newNameAr, newNameEn, newColor, newIcon, newOrder, id]);

        return this.getCategoryById(id);
    }

    static deleteCategory(id) {
        const existing = this.getCategoryById(id);
        if (!existing) {
            throw new Error('الفئة غير موجودة للحذف.');
        }

        // Check if tasks depend on this category
        const taskCount = db.get('SELECT COUNT(*) as c FROM tasks WHERE category_id = ?', [id]).c;
        if (taskCount > 0) {
            throw new Error(`لا يمكن حذف هذه الفئة لأن هناك ${taskCount} نشاط مرتبط بها. يرجى نقل أو حذف الأنشطة أولاً.`);
        }

        db.run('DELETE FROM categories WHERE id = ?', [id]);
        return true;
    }
}

module.exports = CategoryModel;

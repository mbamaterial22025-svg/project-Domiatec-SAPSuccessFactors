const CategoryModel = require('../models/CategoryModel');

class CategoryController {
    static getCategories(req, res, next) {
        try {
            const categories = CategoryModel.getAllCategories();
            res.json({
                success: true,
                categories
            });
        } catch (err) {
            next(err);
        }
    }

    static createCategory(req, res, next) {
        try {
            const newCat = CategoryModel.createCategory(req.body);
            res.status(201).json({
                success: true,
                message: 'تم إضافة الفئة بنجاح',
                messageEn: 'Category added successfully',
                category: newCat
            });
        } catch (err) {
            res.status(400).json({
                error: err.message,
                errorEn: err.message
            });
        }
    }

    static updateCategory(req, res, next) {
        try {
            const updated = CategoryModel.updateCategory(req.params.id, req.body);
            res.json({
                success: true,
                message: 'تم تعديل الفئة بنجاح',
                messageEn: 'Category updated successfully',
                category: updated
            });
        } catch (err) {
            res.status(400).json({
                error: err.message,
                errorEn: err.message
            });
        }
    }

    static deleteCategory(req, res, next) {
        try {
            CategoryModel.deleteCategory(req.params.id);
            res.json({
                success: true,
                message: 'تم حذف الفئة بنجاح',
                messageEn: 'Category deleted successfully'
            });
        } catch (err) {
            res.status(400).json({
                error: err.message,
                errorEn: err.message
            });
        }
    }
}

module.exports = CategoryController;

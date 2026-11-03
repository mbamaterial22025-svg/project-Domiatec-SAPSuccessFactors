const UserModel = require('../models/UserModel');

class UserController {
    static getUsers(req, res, next) {
        try {
            const users = UserModel.getAllUsers();
            res.json({
                success: true,
                count: users.length,
                users
            });
        } catch (err) {
            next(err);
        }
    }

    static createUser(req, res, next) {
        try {
            const { username, password, fullName, role, pin } = req.body;
            if (!username || !password || !fullName) {
                return res.status(400).json({
                    error: 'اسم المستخدم وكلمة المرور والاسم الكامل حقول مطلوبة.',
                    errorEn: 'Username, password and full name are required.'
                });
            }

            const newUser = UserModel.createUser({ username, password, fullName, role, pin });
            res.status(201).json({
                success: true,
                message: 'تم إنشاء المستخدم بنجاح',
                messageEn: 'User created successfully',
                user: newUser
            });
        } catch (err) {
            res.status(400).json({
                error: err.message,
                errorEn: err.message
            });
        }
    }

    static updateUser(req, res, next) {
        try {
            const { username, password, fullName, role, pin } = req.body;
            const updated = UserModel.updateUser(req.params.id, { username, password, fullName, role, pin });
            res.json({
                success: true,
                message: 'تم تحديث بيانات المستخدم بنجاح',
                messageEn: 'User updated successfully',
                user: updated
            });
        } catch (err) {
            res.status(400).json({
                error: err.message,
                errorEn: err.message
            });
        }
    }

    static deleteUser(req, res, next) {
        try {
            UserModel.deleteUser(req.params.id);
            res.json({
                success: true,
                message: 'تم حذف المستخدم بنجاح',
                messageEn: 'User deleted successfully'
            });
        } catch (err) {
            res.status(400).json({
                error: err.message,
                errorEn: err.message
            });
        }
    }
}

module.exports = UserController;


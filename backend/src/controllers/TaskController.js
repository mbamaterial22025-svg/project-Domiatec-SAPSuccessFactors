const TaskModel = require('../models/TaskModel');
const MetricsService = require('../services/MetricsService');
const db = require('../db/database');

class TaskController {
    static getTasks(req, res, next) {
        try {
            const { search, category, assignee, status, deadline } = req.query;
            let tasks = TaskModel.getAllTasks({ search, category, assignee, status });

            // Enrich with deadline status
            tasks = tasks.map(task => ({
                ...task,
                deadlineInfo: MetricsService.getDeadlineStatus(task)
            }));

            // Filter by deadline if requested
            if (deadline && deadline !== 'all') {
                tasks = tasks.filter(t => t.deadlineInfo.code === deadline);
            }

            res.json({
                success: true,
                count: tasks.length,
                tasks
            });
        } catch (err) {
            next(err);
        }
    }

    static getTaskById(req, res, next) {
        try {
            const task = TaskModel.getTaskById(req.params.id);
            if (!task) {
                return res.status(404).json({ error: 'النشاط غير موجود' });
            }
            res.json({
                success: true,
                task: {
                    ...task,
                    deadlineInfo: MetricsService.getDeadlineStatus(task)
                }
            });
        } catch (err) {
            next(err);
        }
    }

    static createTask(req, res, next) {
        try {
            const newTask = TaskModel.createTask(req.body);
            res.status(201).json({
                success: true,
                message: 'تم إنشاء النشاط بنجاح',
                messageEn: 'Task created successfully',
                task: {
                    ...newTask,
                    deadlineInfo: MetricsService.getDeadlineStatus(newTask)
                }
            });
        } catch (err) {
            next(err);
        }
    }

    static updateTask(req, res, next) {
        try {
            const updated = TaskModel.updateTask(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({ error: 'النشاط غير موجود للتعديل' });
            }
            res.json({
                success: true,
                message: 'تم تعديل النشاط بنجاح',
                messageEn: 'Task updated successfully',
                task: {
                    ...updated,
                    deadlineInfo: MetricsService.getDeadlineStatus(updated)
                }
            });
        } catch (err) {
            next(err);
        }
    }

    static updateStatus(req, res, next) {
        try {
            const { status } = req.body;
            if (!status || !['backlog', 'inprogress', 'review', 'done'].includes(status)) {
                return res.status(400).json({ error: 'حالة غير صالحة' });
            }

            const updated = TaskModel.updateStatus(req.params.id, status);
            if (!updated) {
                return res.status(404).json({ error: 'النشاط غير موجود' });
            }

            res.json({
                success: true,
                message: 'تم نقل النشاط بنجاح',
                messageEn: 'Task moved successfully',
                task: {
                    ...updated,
                    deadlineInfo: MetricsService.getDeadlineStatus(updated)
                }
            });
        } catch (err) {
            next(err);
        }
    }

    static deleteTask(req, res, next) {
        try {
            const success = TaskModel.deleteTask(req.params.id);
            if (!success) {
                return res.status(404).json({ error: 'النشاط غير موجود للحذف' });
            }
            res.json({
                success: true,
                message: 'تم حذف النشاط بنجاح',
                messageEn: 'Task deleted successfully'
            });
        } catch (err) {
            next(err);
        }
    }

    static resetDefaults(req, res, next) {
        try {
            db.resetDefaults();
            res.json({
                success: true,
                message: 'تمت استعادة البيانات التوضيحية الافتراضية بنجاح',
                messageEn: 'Default demo data restored successfully'
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = TaskController;


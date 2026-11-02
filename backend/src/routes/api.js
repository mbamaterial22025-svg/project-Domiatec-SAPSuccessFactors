const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');
const ProjectController = require('../controllers/ProjectController');
const CategoryController = require('../controllers/CategoryController');
const TaskController = require('../controllers/TaskController');
const MetricsController = require('../controllers/MetricsController');
const ExportController = require('../controllers/ExportController');

const { requireAdmin } = require('../middlewares/authMiddleware');
const { validateTask } = require('../middlewares/validateTask');

// Health Check
router.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'Weighted Kanban & Timeline API'
    });
});

// Authentication Routes
router.post('/auth/login', AuthController.login);
router.get('/auth/me', AuthController.me);
router.post('/auth/logout', AuthController.logout);
router.post('/auth/verify', ProjectController.verifyPin); // backward compatibility

// User Management (Admin Only)
router.get('/users', requireAdmin, UserController.getUsers);
router.post('/users', requireAdmin, UserController.createUser);
router.put('/users/:id', requireAdmin, UserController.updateUser);
router.delete('/users/:id', requireAdmin, UserController.deleteUser);

// Project Settings & Meta
router.get('/project', ProjectController.getProject);
router.put('/project', requireAdmin, ProjectController.updateProject);

// Categories (Full CRUD)
router.get('/categories', CategoryController.getCategories);
router.post('/categories', requireAdmin, CategoryController.createCategory);
router.put('/categories/:id', requireAdmin, CategoryController.updateCategory);
router.delete('/categories/:id', requireAdmin, CategoryController.deleteCategory);

// Tasks (Kanban Activities Full CRUD)
router.get('/tasks', TaskController.getTasks);
router.get('/tasks/:id', TaskController.getTaskById);
router.post('/tasks', requireAdmin, validateTask, TaskController.createTask);
router.put('/tasks/:id', requireAdmin, validateTask, TaskController.updateTask);
router.patch('/tasks/:id/status', requireAdmin, TaskController.updateStatus);
router.delete('/tasks/:id', requireAdmin, TaskController.deleteTask);

// Live Metrics & KPIs
router.get('/metrics', MetricsController.getMetrics);

// Export & Import
router.get('/export/csv', ExportController.downloadCSV);
router.get('/backup/export', ExportController.exportJSON);
router.post('/backup/import', requireAdmin, ExportController.importJSON);

// Reset to Defaults (Admin)
router.post('/reset', requireAdmin, TaskController.resetDefaults);

module.exports = router;

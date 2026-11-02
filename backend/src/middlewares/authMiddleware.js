const ProjectModel = require('../models/ProjectModel');
const TokenService = require('../services/TokenService');

function requireAdmin(req, res, next) {
    // Read-only methods don't require admin
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    // 1. Check Bearer Token / Session Token
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '') || req.headers['x-admin-token'];
    if (token) {
        const session = TokenService.getSession(token);
        if (session && session.user && session.user.role === 'admin') {
            req.user = session.user;
            return next();
        }
    }

    // 2. Fallback check for x-admin-pin
    const providedPin = req.headers['x-admin-pin'] || req.body?.adminPin;
    const project = ProjectModel.getProject();

    if (providedPin && project && String(providedPin).trim() === String(project.adminPin).trim()) {
        req.user = { id: 'pin-admin', username: 'admin', role: 'admin' };
        return next();
    }

    return res.status(403).json({
        error: 'صلاحية مرفوضة: يجب تسجيل الدخول كمدير نظام (Admin) لتنفيذ هذا الإجراء.',
        errorEn: 'Forbidden: Admin authentication required.'
    });
}

module.exports = { requireAdmin };

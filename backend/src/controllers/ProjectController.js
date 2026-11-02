const ProjectModel = require('../models/ProjectModel');

class ProjectController {
    static getProject(req, res, next) {
        try {
            const project = ProjectModel.getProject();
            if (!project) {
                return res.status(404).json({ error: 'المشروع غير موجود' });
            }
            // Return public fields (exclude sensitive internal PIN, return hasPin flag)
            res.json({
                success: true,
                project: {
                    id: project.id,
                    titleAr: project.titleAr,
                    titleEn: project.titleEn,
                    wipLimit: project.wipLimit,
                    updatedAt: project.updatedAt
                }
            });
        } catch (err) {
            next(err);
        }
    }

    static updateProject(req, res, next) {
        try {
            const { titleAr, titleEn, wipLimit, adminPin } = req.body;
            const updated = ProjectModel.updateProject('main-project', {
                titleAr,
                titleEn,
                wipLimit,
                adminPin
            });
            res.json({
                success: true,
                message: 'تم تحديث إعدادات المشروع بنجاح',
                messageEn: 'Project settings updated successfully',
                project: {
                    id: updated.id,
                    titleAr: updated.titleAr,
                    titleEn: updated.titleEn,
                    wipLimit: updated.wipLimit,
                    updatedAt: updated.updatedAt
                }
            });
        } catch (err) {
            next(err);
        }
    }

    static verifyPin(req, res, next) {
        try {
            const { pin } = req.body;
            const isValid = ProjectModel.verifyPin('main-project', pin);
            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    error: 'رمز PIN غير صحيح!',
                    errorEn: 'Incorrect PIN!'
                });
            }
            res.json({
                success: true,
                message: 'تم التحقق بنجاح',
                role: 'admin'
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = ProjectController;


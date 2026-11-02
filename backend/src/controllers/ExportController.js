const ExportService = require('../services/ExportService');

class ExportController {
    static downloadCSV(req, res, next) {
        try {
            const lang = req.query.lang === 'en' ? 'en' : 'ar';
            const csv = ExportService.generateCSV(lang);
            const dateStr = new Date().toISOString().split('T')[0];
            const filename = `kanban_project_${lang}_${dateStr}.csv`;

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.status(200).send(csv);
        } catch (err) {
            next(err);
        }
    }

    static exportJSON(req, res, next) {
        try {
            const backup = ExportService.exportJSONBackup();
            const dateStr = new Date().toISOString().split('T')[0];
            res.setHeader('Content-Disposition', `attachment; filename="kanban_backup_${dateStr}.json"`);
            res.json(backup);
        } catch (err) {
            next(err);
        }
    }

    static importJSON(req, res, next) {
        try {
            const result = ExportService.importJSONBackup(req.body);
            res.json({
                success: true,
                message: `تم استيراد ${result.count} نشاط بنجاح`,
                messageEn: `Successfully imported ${result.count} activities`
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = ExportController;


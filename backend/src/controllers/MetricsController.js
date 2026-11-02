const MetricsService = require('../services/MetricsService');

class MetricsController {
    static getMetrics(req, res, next) {
        try {
            const metrics = MetricsService.calculateProjectMetrics();
            res.json({
                success: true,
                metrics
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = MetricsController;


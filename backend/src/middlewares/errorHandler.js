function errorHandler(err, req, res, next) {
    console.error('API Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'حدث خطأ داخلي في الخادم',
        errorEn: err.message || 'Internal Server Error'
    });
}

module.exports = errorHandler;


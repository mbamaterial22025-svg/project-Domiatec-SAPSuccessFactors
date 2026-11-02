const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');

const apiRouter = require('./routes/api');
const errorHandler = require('./middlewares/errorHandler');
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database connection on boot
db.getDb();

// Middlewares
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-pin']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logger in dev
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// API Routes
app.use('/api', apiRouter);

// Serve Frontend build if available (Single-Port Production Mode)
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
    console.log(`Serving static frontend build from: ${frontendDist}`);
    app.use(express.static(frontendDist));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(frontendDist, 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head><meta charset="UTF-8"><title>Weighted Kanban API Server</title></head>
            <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #0f172a; color: white;">
                <h2>🚀 خادم لوحة كانبان الموزونة يعمل بنجاح!</h2>
                <p>Weighted Kanban & Timeline API is running on port <strong>${PORT}</strong>.</p>
                <p><a href="/api/health" style="color: #6366f1;">فحص الحالة /api/health</a> | <a href="/api/tasks" style="color: #6366f1;">قائمة الأنشطة /api/tasks</a></p>
            </body>
            </html>
        `);
    });
}

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 Weighted Kanban Backend Server Started`);
    console.log(`📡 URL: http://0.0.0.0:${PORT}`);
    console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🗄️ Database: SQLite (data/kanban.db)`);
    console.log(`====================================================`);
});


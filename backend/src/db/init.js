const db = require('./database');

console.log('Initializing Weighted Kanban SQLite Database...');
try {
    db.resetDefaults();
    console.log('✓ Database initialized and seeded successfully at data/kanban.db');
} catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
}


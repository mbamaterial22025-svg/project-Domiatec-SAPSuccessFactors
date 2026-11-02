-- ====================================================================
-- Weighted Kanban & Timeline Tracker - Relational Database Schema
-- Database Engine: SQLite (Production Relational Embedded SQL)
-- Supports full ACID transactions, foreign keys, and indexes
-- ====================================================================

PRAGMA foreign_keys = ON;

-- 1. Projects Table (Project Metadata, WIP Limits & Admin PIN)
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title_ar TEXT NOT NULL DEFAULT 'مشروع تطوير المنصة الرقمية 2026',
    title_en TEXT NOT NULL DEFAULT 'Digital Platform Development Project 2026',
    wip_limit INTEGER NOT NULL DEFAULT 15,
    admin_pin TEXT NOT NULL DEFAULT '1234',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table (Project Phases / Workstreams)
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    color_class TEXT NOT NULL,
    icon TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0
);

-- 3. Tasks Table (Weighted Kanban Activities)
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL DEFAULT 'main-project',
    title_ar TEXT NOT NULL,
    title_en TEXT,
    category_id TEXT NOT NULL,
    points INTEGER NOT NULL CHECK(points IN (1, 2, 3, 5, 8, 13, 20, 40)),
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    assignee_ar TEXT NOT NULL,
    assignee_en TEXT,
    status TEXT NOT NULL CHECK(status IN ('backlog', 'inprogress', 'review', 'done')),
    notes_ar TEXT,
    notes_en TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE
);

-- 4. Activity Audit Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT,
    action TEXT NOT NULL, -- 'created', 'updated', 'status_changed', 'deleted', 'reset'
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Users Table (Admin & Viewer Authentication and User Management)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'viewer')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- Performance Indexes
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_ar ON tasks(assignee_ar);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON activity_logs(created_at);


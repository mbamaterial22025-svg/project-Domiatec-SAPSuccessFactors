const crypto = require('crypto');
const db = require('../db/database');

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
    if (!storedHash || !storedHash.includes(':')) return false;
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === originalHash;
}

class UserModel {
    static getAllUsers() {
        return db.query(`
            SELECT id, username, full_name AS fullName, role,
                   created_at AS createdAt, updated_at AS updatedAt
            FROM users
            ORDER BY created_at ASC
        `);
    }

    static getUserById(id) {
        return db.get(`
            SELECT id, username, full_name AS fullName, role,
                   created_at AS createdAt, updated_at AS updatedAt
            FROM users
            WHERE id = ?
        `, [id]);
    }

    static getUserByUsername(username) {
        return db.get(`
            SELECT id, username, password_hash AS passwordHash, full_name AS fullName, role,
                   created_at AS createdAt, updated_at AS updatedAt
            FROM users
            WHERE LOWER(username) = LOWER(?)
        `, [username.trim()]);
    }

    static createUser({ username, password, fullName, role = 'admin' }) {
        const cleanUsername = username.trim().toLowerCase();
        const existing = this.getUserByUsername(cleanUsername);
        if (existing) {
            throw new Error(`اسم المستخدم '${username}' مسجل مسبقاً، يرجى اختيار اسم مستخدم آخر.`);
        }

        if (!password || password.length < 4) {
            throw new Error('كلمة المرور يجب أن تتكون من 4 أحرف على الأقل.');
        }

        const id = 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
        const passHash = hashPassword(password);
        const validRole = role === 'viewer' ? 'viewer' : 'admin';

        db.run(`
            INSERT INTO users (id, username, password_hash, full_name, role)
            VALUES (?, ?, ?, ?, ?)
        `, [id, cleanUsername, passHash, fullName.trim(), validRole]);

        return this.getUserById(id);
    }

    static updateUser(id, { username, password, fullName, role }) {
        const existing = this.getUserById(id);
        if (!existing) {
            throw new Error('المستخدم غير موجود للتعديل.');
        }

        let newUsername = existing.username;
        if (username && username.trim().toLowerCase() !== existing.username) {
            const check = this.getUserByUsername(username);
            if (check && check.id !== id) {
                throw new Error(`اسم المستخدم '${username}' مستخدم بالفعل.`);
            }
            newUsername = username.trim().toLowerCase();
        }

        const newFullName = fullName !== undefined ? fullName.trim() : existing.fullName;
        const newRole = role !== undefined ? (role === 'viewer' ? 'viewer' : 'admin') : existing.role;

        // If demoting to viewer, ensure at least one admin remains
        if (existing.role === 'admin' && newRole === 'viewer') {
            const adminCount = db.get("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").c;
            if (adminCount <= 1) {
                throw new Error('لا يمكن تغيير صلاحية المدير الوحيد المتبقي في النظام.');
            }
        }

        if (password && password.trim()) {
            if (password.trim().length < 4) {
                throw new Error('كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل.');
            }
            const passHash = hashPassword(password.trim());
            db.run(`
                UPDATE users
                SET username = ?, full_name = ?, role = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [newUsername, newFullName, newRole, passHash, id]);
        } else {
            db.run(`
                UPDATE users
                SET username = ?, full_name = ?, role = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [newUsername, newFullName, newRole, id]);
        }

        return this.getUserById(id);
    }

    static deleteUser(id) {
        const existing = this.getUserById(id);
        if (!existing) {
            throw new Error('المستخدم غير موجود للحذف.');
        }

        if (existing.role === 'admin') {
            const adminCount = db.get("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").c;
            if (adminCount <= 1) {
                throw new Error('لا يمكن حذف المدير الوحيد في النظام.');
            }
        }

        db.run('DELETE FROM users WHERE id = ?', [id]);
        return true;
    }

    static verifyCredentials(username, password) {
        if (!username || !password) return null;
        const user = this.getUserByUsername(username);
        if (!user) return null;

        const isValid = verifyPassword(password, user.passwordHash);
        if (!isValid) return null;

        return {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            role: user.role
        };
    }

    static seedDefaultAdmin() {
        const count = db.get('SELECT COUNT(*) as c FROM users').c;
        if (count === 0) {
            const passHash = hashPassword('admin123');
            db.run(`
                INSERT INTO users (id, username, password_hash, full_name, role)
                VALUES ('usr-admin', 'admin', ?, 'مدير النظام الرئيسي', 'admin')
            `, [passHash]);
            console.log('✓ Default Admin User created: username="admin", password="admin123"');
        }
    }
}

module.exports = UserModel;


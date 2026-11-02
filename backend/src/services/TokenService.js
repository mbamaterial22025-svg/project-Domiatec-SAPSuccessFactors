const crypto = require('crypto');

const activeSessions = new Map();

class TokenService {
    static createSession(user) {
        const token = 'tok_' + crypto.randomBytes(24).toString('hex');
        const session = {
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                role: user.role
            },
            createdAt: Date.now(),
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        };
        activeSessions.set(token, session);
        return session;
    }

    static getSession(token) {
        if (!token) return null;
        const session = activeSessions.get(token);
        if (!session) return null;
        if (Date.now() > session.expiresAt) {
            activeSessions.delete(token);
            return null;
        }
        return session;
    }

    static deleteSession(token) {
        if (token) activeSessions.delete(token);
    }
}

module.exports = TokenService;


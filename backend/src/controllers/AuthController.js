const UserModel = require('../models/UserModel');
const ProjectModel = require('../models/ProjectModel');
const TokenService = require('../services/TokenService');

class AuthController {
    static login(req, res, next) {
        try {
            const { username, password, pin } = req.body;

            // 1. PIN-based login (checks specific user PIN or project admin PIN)
            if (pin && !username && !password) {
                const cleanPin = pin.toString().trim();
                const userByPin = UserModel.getUserByPin ? UserModel.getUserByPin(cleanPin) : null;
                if (userByPin) {
                    const session = TokenService.createSession({
                        id: userByPin.id,
                        username: userByPin.username,
                        fullName: userByPin.fullName || userByPin.username,
                        role: userByPin.role || 'viewer'
                    });
                    return res.json({
                        success: true,
                        message: `مرحباً بك، ${userByPin.fullName}`,
                        token: session.token,
                        user: session.user
                    });
                }

                const isValidPin = ProjectModel.verifyPin('main-project', cleanPin);
                if (isValidPin) {
                    const session = TokenService.createSession({
                        id: 'pin-admin',
                        username: 'admin',
                        fullName: 'مدير النظام (PIN)',
                        role: 'admin'
                    });
                    return res.json({
                        success: true,
                        message: 'تم تسجيل الدخول بنجاح',
                        token: session.token,
                        user: session.user
                    });
                }

                return res.status(401).json({
                    success: false,
                    error: 'رمز PIN غير صحيح!',
                    errorEn: 'Incorrect PIN!'
                });
            }

            // 2. Username & Password Login
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'يرجى إدخال اسم المستخدم وكلمة المرور.',
                    errorEn: 'Please provide username and password.'
                });
            }

            const user = UserModel.verifyCredentials(username, password);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
                    errorEn: 'Invalid username or password.'
                });
            }

            const session = TokenService.createSession(user);
            res.json({
                success: true,
                message: `مرحباً بك، ${user.fullName}`,
                messageEn: `Welcome back, ${user.fullName}`,
                token: session.token,
                user: session.user
            });
        } catch (err) {
            next(err);
        }
    }

    static me(req, res, next) {
        try {
            const authHeader = req.headers['authorization'] || '';
            const token = authHeader.replace(/^Bearer\s+/i, '') || req.headers['x-admin-token'];
            const session = TokenService.getSession(token);

            if (session) {
                return res.json({
                    success: true,
                    authenticated: true,
                    user: session.user
                });
            }

            // Check if PIN header is present
            const pin = req.headers['x-admin-pin'];
            if (pin && ProjectModel.verifyPin('main-project', pin)) {
                return res.json({
                    success: true,
                    authenticated: true,
                    user: {
                        id: 'pin-admin',
                        username: 'admin',
                        fullName: 'مدير النظام (PIN)',
                        role: 'admin'
                    }
                });
            }

            res.json({
                success: true,
                authenticated: false,
                user: {
                    id: 'guest',
                    username: 'viewer',
                    fullName: 'زائر / عرض الإدارة',
                    role: 'viewer'
                }
            });
        } catch (err) {
            next(err);
        }
    }

    static logout(req, res, next) {
        try {
            const authHeader = req.headers['authorization'] || '';
            const token = authHeader.replace(/^Bearer\s+/i, '') || req.headers['x-admin-token'];
            if (token) TokenService.deleteSession(token);
            res.json({
                success: true,
                message: 'تم تسجيل الخروج بنجاح',
                messageEn: 'Logged out successfully'
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = AuthController;


import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LockKeyhole, User, KeyRound, X, KeySquare } from 'lucide-react';

export default function LoginModal() {
  const { lang, t, loginModal, setLoginModal, handleLogin } = useApp();

  const [mode, setMode] = useState('credentials'); // 'credentials' | 'pin'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!loginModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = mode === 'credentials'
        ? { username: username.trim(), password: password.trim() }
        : { pin: pin.trim() };

      const res = await handleLogin(payload);
      if (!res.success) {
        setError(res.error || t.pinError);
      }
    } catch (err) {
      setError(err.message || t.pinError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <LockKeyhole className="w-5 h-5 text-indigo-600" />
            <span>{t.loginTitle}</span>
          </h3>
          <button
            onClick={() => setLoginModal(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Username & Password vs Insert PIN */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('credentials'); setError(''); }}
            className={`flex-1 py-1.5 rounded-lg text-center transition ${
              mode === 'credentials' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.thUsername} & {t.lblPassword}
          </button>
          <button
            type="button"
            onClick={() => { setMode('pin'); setError(''); }}
            className={`flex-1 py-1.5 rounded-lg text-center transition ${
              mode === 'pin' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Insert PIN
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'credentials' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblUsername}</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
                  <input
                    type="text"
                    dir="ltr"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={lang === 'ar' ? 'اسم المستخدم' : 'Username'}
                    className="w-full ps-9 pe-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblPassword}</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
                  <input
                    type="password"
                    dir="ltr"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full ps-9 pe-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Insert PIN</label>
              <div className="relative">
                <KeySquare className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
                <input
                  type="password"
                  dir="ltr"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Insert PIN"
                  className="w-full ps-9 pe-3 py-2 text-center tracking-widest text-base font-black border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200 text-center">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setLoginModal(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              {t.btnCancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              {loading ? '...' : (lang === 'ar' ? 'دخول' : 'Sign In')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

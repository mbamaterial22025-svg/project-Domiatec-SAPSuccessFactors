import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, ShieldAlert, KeyRound, X, RotateCcw } from 'lucide-react';
import { api } from '../services/api';

export default function ResetModal() {
  const { lang, t, role, currentUser, resetModal, setResetModal, resetData } = useApp();

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!resetModal || role !== 'admin') return null;

  const handleClose = () => {
    setPassword('');
    setError('');
    setResetModal(false);
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError(lang === 'ar' ? 'يرجى إدخال كلمة المرور لتأكيد العملية' : 'Please enter your password to confirm');
      return;
    }

    setLoading(true);

    try {
      // 1. Verify password against current user or admin
      let isValid = false;

      // Try API login
      try {
        const username = currentUser ? currentUser.username : 'admin';
        const res = await api.login({ username, password: password.trim() });
        if (res && res.success) isValid = true;
      } catch (e) {
        // Fallback to checking localStore
      }

      // If not yet verified, check localStore users
      if (!isValid) {
        try {
          const rawUsers = localStorage.getItem('wk_store_users');
          const users = rawUsers ? JSON.parse(rawUsers) : [];
          const matched = users.some(u =>
            u.role === 'admin' && (u.passwordHash === password.trim() || (u.username === 'admin' && password.trim() === 'admin123'))
          );
          if (matched) isValid = true;
        } catch (e) {}
      }

      // Default admin password fallback
      if (!isValid && password.trim() === 'admin123') {
        isValid = true;
      }

      if (!isValid) {
        setError(lang === 'ar'
          ? '❌ كلمة المرور غير صحيحة! تم منع إعادة الضبط لحماية البيانات.'
          : '❌ Incorrect password! Reset blocked to protect project data.'
        );
        setLoading(false);
        return;
      }

      // Password is correct, perform factory reset
      await resetData();
      handleClose();
      alert(lang === 'ar'
        ? '✅ تم استعادة النظام والحالة الافتراضية بنجاح.'
        : '✅ System successfully restored to its initial default state.'
      );
    } catch (err) {
      setError(err.message || (lang === 'ar' ? 'فشل إعادة ضبط البيانات' : 'Failed to reset data'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-rose-200 overflow-hidden space-y-4 p-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
              <ShieldAlert className="w-6 h-6 text-rose-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {lang === 'ar' ? 'تحذير أمني: استعادة ضبط المصنع' : 'Security Alert: Factory Reset'}
              </h3>
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                {lang === 'ar' ? 'إجراء حساس ومحمي بكلمة المرور' : 'Protected Sensitive Action'}
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Strong Alert Message Box */}
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-rose-900">
          <div className="flex items-center gap-2 font-black text-xs text-rose-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {lang === 'ar' ? 'تنبيه بالغ الأهمية:' : 'CRITICAL WARNING:'}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-rose-800 font-semibold">
            {lang === 'ar'
              ? 'هذا الخيار سيقوم بحذف وإلغاء كافة البيانات المضافة وتعديلات المشروع والأنشطة لإرجاع النظام إلى حالته الافتراضية الأصلية (الضبط المصنعي). هذا الإجراء لا يمكن التراجع عنه.'
              : 'This operation will permanently remove and delete all custom project data, tasks, and modifications to restore the system to its initial default state. This action cannot be undone.'}
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleConfirmReset} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {lang === 'ar'
                  ? 'لتأكيد الحذف، يرجى إدخال كلمة مرور الأدمن:'
                  : 'To confirm deletion, please enter your Admin Password:'}
              </span>
            </label>
            <input
              type="password"
              dir="ltr"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={lang === 'ar' ? 'أدخل كلمة مرور الأدمن للتأكيد' : 'Enter Admin Password'}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-100/80 border border-rose-300 text-rose-800 text-xs font-bold text-center">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              {t.btnCancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>
                {loading
                  ? '...'
                  : (lang === 'ar' ? 'تأكيد الحذف واستعادة الافتراضي' : 'Confirm Reset to Default')}
              </span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

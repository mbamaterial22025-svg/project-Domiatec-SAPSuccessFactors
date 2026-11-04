import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Eye, LockKeyhole, Languages, LogOut, User, RefreshCw } from 'lucide-react';

export default function RoleBanner() {
  const {
    lang,
    t,
    role,
    currentUser,
    requestRoleSwitch,
    handleLogout,
    toggleLanguage,
    isOnline,
    lastSyncTime,
    isRefreshing,
    handleManualRefresh,
    isAutoSyncPaused
  } = useApp();

  const isAdmin = role === 'admin';

  return (
    <div className="bg-slate-900 text-white text-xs py-1.5 px-4 sm:px-6 border-b border-slate-800 select-none">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        
        {/* Left Side: System Telemetry & Role Badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Active Mode Pill */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
              isAdmin
                ? 'bg-indigo-500/25 text-indigo-300 border-indigo-400/35'
                : 'bg-amber-500/25 text-amber-300 border-amber-400/35'
            }`}
          >
            {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
            <span>
              {isAdmin
                ? (lang === 'ar' ? 'وضع الإدارة والتحكم (Admin)' : 'Admin Mode (Full Control)')
                : (lang === 'ar' ? 'العرض التنفيذي للإدارة' : 'Executive Management View')}
            </span>
          </span>

          {/* Cloud Database Connection & Pause Guard Status */}
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                isAutoSyncPaused
                  ? 'bg-amber-400'
                  : isOnline
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-sky-400'
              }`}
            />
            <span>
              {isAutoSyncPaused
                ? (lang === 'ar' ? 'التحديث مؤقت أثناء التعديل' : 'Auto-sync paused during editing')
                : (lang === 'ar' ? 'متصل بالسحابة وقاعدة البيانات (مباشر)' : 'Live Database & Cloud Connected')}
            </span>
          </span>

          {/* Live Sync Timestamp & Force Refresh */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/80 text-[10px]">
            <span className="hidden md:inline text-slate-400">
              {lang === 'ar' ? 'مزامنة:' : 'Sync:'}
            </span>
            <span className="font-mono text-emerald-300 font-bold">
              {lastSyncTime ? lastSyncTime.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
            </span>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-0.5 rounded hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition"
              title={lang === 'ar' ? 'تحديث فوري للبيانات من السحابة الآن' : 'Force refresh from cloud now'}
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>

          {/* Current User Profile badge */}
          {currentUser && (
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-200 border border-slate-700 text-[11px]">
              <User className="w-3 h-3 text-indigo-400" />
              <span>{currentUser.fullName}</span>
            </span>
          )}
        </div>

        {/* Right Side: Role Switcher & Language Controls (Single Row, No Wrap) */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Switch Role Button */}
          {isAdmin ? (
            <button
              onClick={() => requestRoleSwitch('management')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition shadow-2xs"
              title={lang === 'ar' ? 'الانتقال إلى وضع المعاينة التنفيذية' : 'Switch to Executive View'}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'معاينة العرض التنفيذي' : 'Executive View'}</span>
            </button>
          ) : (
            <button
              onClick={() => requestRoleSwitch('admin')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition shadow-2xs"
              title={lang === 'ar' ? 'تسجيل الدخول كمسؤول للنظام' : 'Login to Admin Panel'}
            >
              <LockKeyhole className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'ar' ? 'دخول الأدمن' : 'Admin Login'}</span>
            </button>
          )}

          {/* Logout button (Admin only) */}
          {isAdmin && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition shadow-2xs"
              title={t.logoutBtn}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'خروج' : 'Logout'}</span>
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black bg-white/10 hover:bg-white/20 text-white border border-white/15 transition shadow-2xs"
            title={lang === 'ar' ? 'Switch to English' : 'التحويل للغة العربية'}
          >
            <Languages className="w-3.5 h-3.5 text-amber-300" />
            <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

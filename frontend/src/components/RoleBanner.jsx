import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Eye, LockKeyhole, Globe, Languages, Users, FolderKanban, LogOut, User, RefreshCw } from 'lucide-react';

export default function RoleBanner() {
  const {
    lang,
    t,
    role,
    currentUser,
    requestRoleSwitch,
    handleLogout,
    setBackupModal,
    setUsersModal,
    setCategoriesModal,
    toggleLanguage,
    isOnline,
    lastSyncTime,
    isRefreshing,
    handleManualRefresh
  } = useApp();

  const isAdmin = role === 'admin';

  return (
    <div className="bg-slate-900 text-white text-xs py-2 px-4 sm:px-6 border-b border-slate-800 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Mode Indicator & Sync Status */}
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              isAdmin
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
            }`}
          >
            {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isAdmin ? t.roleAdminActive : t.roleMgmtActive}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-sky-400'
              }`}
            />
            <span>{isOnline ? t.cloudSynced : t.localSynced}</span>
          </span>

          {/* Live Sync Timestamp & Force Refresh */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/80 text-[10px]">
            <span className="hidden sm:inline text-slate-400">
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
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-200 border border-slate-700 text-[11px]">
              <User className="w-3 h-3 text-indigo-400" />
              <span>{currentUser.fullName}</span>
            </span>
          )}
        </div>

        {/* Action Controls & Switchers */}
        <div className="flex items-center gap-2">
          {/* Admin Management Shortcuts */}
          {isAdmin && (
            <>
              <button
                onClick={() => setUsersModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition shadow-xs"
                title={t.userManagementTitle}
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">{t.manageUsersBtn}</span>
              </button>

              <button
                onClick={() => setCategoriesModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 transition shadow-xs"
                title={t.modalCategoriesTitle}
              >
                <FolderKanban className="w-3.5 h-3.5 text-violet-400" />
                <span className="hidden sm:inline">{t.manageCategoriesBtn}</span>
              </button>
            </>
          )}

          {/* Switch between Management Read-Only & Admin */}
          <div className="bg-slate-800 p-0.5 rounded-lg flex items-center border border-slate-700">
            <button
              onClick={() => requestRoleSwitch('management')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                !isAdmin
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t.navManagementPage}</span>
            </button>
            <button
              onClick={() => requestRoleSwitch('admin')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                isAdmin
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LockKeyhole className="w-3.5 h-3.5" />
              <span>{t.navAdminPage}</span>
            </button>
          </div>

          {/* Logout if admin */}
          {isAdmin && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition shadow-xs"
              title={t.logoutBtn}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
            </button>
          )}

          {/* Language Switcher (AR / EN) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition"
          >
            <Languages className="w-3.5 h-3.5 text-amber-300" />
            <span>{lang === 'ar' ? 'English (EN)' : 'العربية (AR)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  X,
  Plus,
  Users,
  FolderKanban,
  SlidersHorizontal,
  Download,
  DownloadCloud,
  UploadCloud,
  RotateCcw,
  Columns4,
  GanttChart,
  PieChart,
  ShieldCheck,
  Calendar,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Database,
  LogOut,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function AdminSidebar() {
  const {
    lang,
    t,
    role,
    project,
    tasks,
    categories,
    users,
    currentUser,
    currentView,
    setCurrentView,
    setTaskModal,
    setSettingsModal,
    setUsersModal,
    setCategoriesModal,
    setResetModal,
    adminSidebarOpen,
    setAdminSidebarOpen,
    refreshData,
    handleLogout,
    isOnline
  } = useApp();

  const fileInputRef = useRef(null);
  const isAdmin = role === 'admin';

  if (!isAdmin) return null;

  const isRtl = lang === 'ar';
  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  const handleClose = () => {
    setAdminSidebarOpen(false);
  };

  // Live dynamic counts that update directly
  const liveUsersCount = (users && users.length > 0)
    ? users.length
    : (JSON.parse(localStorage.getItem('wk_store_users') || '[]').length || 1);

  const liveCategoriesCount = (categories && categories.length > 0)
    ? categories.length
    : (JSON.parse(localStorage.getItem('wk_store_categories') || '[]').length || 6);

  const liveTasksCount = tasks?.length || 0;

  // Client-side CSV Export
  const handleExportCSV = () => {
    try {
      const isAr = lang === 'ar';
      const headers = isAr
        ? ['المعرف', 'عنوان النشاط (عربي)', 'عنوان النشاط (إنجليزي)', 'المرحلة / القسم', 'النقاط / الوزن', 'الحالة', 'تاريخ البدء', 'تاريخ الاستحقاق', 'المسؤول']
        : ['ID', 'Title (AR)', 'Title (EN)', 'Category', 'Points/Weight', 'Status', 'Start Date', 'Due Date', 'Assignee'];

      const statusMap = {
        backlog: isAr ? 'قيد الانتظار' : 'Backlog',
        inprogress: isAr ? 'قيد التنفيذ' : 'In Progress',
        review: isAr ? 'قيد المراجعة والاختبار' : 'Review/Testing',
        done: isAr ? 'مكتمل' : 'Done'
      };

      const categoryMap = {};
      (categories || []).forEach(c => {
        categoryMap[c.id || c.key] = isAr ? c.nameAr : c.nameEn;
      });

      const escapeCSV = (val) => {
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      };

      const rows = (tasks || []).map(task => [
        escapeCSV(task.id),
        escapeCSV(task.titleAr || ''),
        escapeCSV(task.titleEn || task.titleAr || ''),
        escapeCSV(categoryMap[task.categoryId || task.category] || task.categoryId || task.category || ''),
        escapeCSV(task.points || task.weight || 1),
        escapeCSV(statusMap[task.status] || task.status),
        escapeCSV(task.startDate || ''),
        escapeCSV(task.dueDate || ''),
        escapeCSV(task.assigneeAr || task.assignedTo || '')
      ]);

      const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `Domiatec_SAP_Activities_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Client CSV Export error:', err);
      window.location.href = api.getCSVUrl(lang);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const data = await api.exportJSON();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const today = new Date().toISOString().split('T')[0];
      a.download = `Domiatec_SAP_Full_Backup_${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(lang === 'ar' ? 'فشل تحميل النسخة الاحتياطية: ' + err.message : 'Failed to download backup: ' + err.message);
    }
  };

  const handleRestoreFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(lang === 'ar'
      ? 'هل أنت متأكد من استرجاع البيانات من هذا الملف؟ سيتم تحديث وتعديل كافة الأنشطة والمستخدمين.'
      : 'Are you sure you want to restore data from this backup file? All activities and users will be updated.')) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        await api.importJSON(json);
        alert(lang === 'ar' ? '✅ تم استرجاع النسخة الاحتياطية بنجاح!' : '✅ Backup restored successfully!');
        await refreshData();
      } catch (err) {
        alert(lang === 'ar' ? 'فشل استرجاع النسخة: ' + (err.message || 'ملف غير صالح') : 'Failed to restore backup: ' + (err.message || 'Invalid file'));
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          adminSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Modern Drawer Container */}
      <aside
        className={`fixed top-0 bottom-0 z-50 w-84 sm:w-96 bg-white shadow-2xl flex flex-col transition-all duration-300 ease-out ${
          isRtl
            ? `right-0 border-l border-slate-200 ${adminSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`
            : `left-0 border-r border-slate-200 ${adminSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
        }`}
      >
        {/* 1. Header with Company Logo & Status */}
        <div className="p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0 shadow-md">
          <div className="flex items-center justify-between gap-3 mb-3">
            {/* Domiatec Logo in Menu */}
            <div className="bg-white px-2.5 py-1.5 rounded-xl shadow-xs border border-white/20 flex items-center">
              <img
                src="/domiatec-logo.png"
                alt="Domiatec Agri-Group"
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition duration-200"
              title={lang === 'ar' ? 'إغلاق القائمة' : 'Close Menu'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 tracking-wide">
                  ٢٠٢٦
                </span>
                <span className="text-[11px] font-bold text-slate-300">
                  {lang === 'ar' ? 'لوحة تحكم الأدمن' : 'Admin Control Panel'}
                </span>
              </div>
              <p className="text-xs text-indigo-200/90 font-medium mt-1 truncate max-w-[260px]">
                {lang === 'ar' ? 'مشروع التحول الرقمي SAP SuccessFactors' : 'SAP SuccessFactors Digital Project'}
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isOnline ? 'Active' : 'Offline'}</span>
            </span>
          </div>
        </div>

        {/* 2. Admin User Bar */}
        <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
              {currentUser?.fullName?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="font-extrabold text-slate-900 leading-none">
                {currentUser?.fullName || (lang === 'ar' ? 'مدير النظام الرئيسي' : 'Main Admin')}
              </p>
              <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>{lang === 'ar' ? 'صلاحيات كاملة' : 'Full Privileges'}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-lg text-[11px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
              {liveTasksCount} {lang === 'ar' ? 'نشاط' : 'Tasks'}
            </span>
          </div>
        </div>

        {/* 3. Scrollable Styled Menu Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Quick Action: New Activity */}
          <div>
            <button
              onClick={() => {
                setTaskModal({ isOpen: true, taskId: null, defaultStatus: 'backlog' });
                handleClose();
              }}
              className="w-full py-3 px-4 rounded-xl font-black text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 shadow-md shadow-indigo-300/40 flex items-center justify-between transition-all duration-200 transform hover:scale-[1.01] active:scale-98 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1 rounded-lg bg-white/20 text-white group-hover:rotate-90 transition-transform duration-300">
                  <Plus className="w-4 h-4" />
                </div>
                <span>{lang === 'ar' ? '+ نشاط جديد للمشروع' : '+ New Project Activity'}</span>
              </div>
              <ArrowIcon className="w-4 h-4 opacity-80 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Section: Main Display Views */}
          <div className="bg-slate-50/80 p-2.5 rounded-2xl border border-slate-200/80 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-2 py-1">
              {lang === 'ar' ? 'شاشات العرض والمتابعة' : 'Display Views'}
            </p>

            {/* View 1: Operational Workflow Board */}
            <button
              onClick={() => {
                setCurrentView('kanban');
                handleClose();
              }}
              className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 ${
                currentView === 'kanban'
                  ? 'bg-white text-indigo-700 border border-indigo-200/80 shadow-xs'
                  : 'text-slate-700 hover:bg-white hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${currentView === 'kanban' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <Columns4 className="w-4 h-4" />
                </div>
                <span>Operational Workflow Board</span>
              </div>
              {currentView === 'kanban' ? (
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              ) : (
                <ArrowIcon className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* View 2: Project Timeline */}
            <button
              onClick={() => {
                setCurrentView('timeline');
                handleClose();
              }}
              className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 ${
                currentView === 'timeline'
                  ? 'bg-white text-indigo-700 border border-indigo-200/80 shadow-xs'
                  : 'text-slate-700 hover:bg-white hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${currentView === 'timeline' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <GanttChart className="w-4 h-4" />
                </div>
                <span>Project Timeline</span>
              </div>
              {currentView === 'timeline' ? (
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              ) : (
                <ArrowIcon className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* View 3: Executive Summary */}
            <button
              onClick={() => {
                setCurrentView('executive');
                handleClose();
              }}
              className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 ${
                currentView === 'executive'
                  ? 'bg-white text-indigo-700 border border-indigo-200/80 shadow-xs'
                  : 'text-slate-700 hover:bg-white hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${currentView === 'executive' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <PieChart className="w-4 h-4" />
                </div>
                <span>Executive Summary</span>
              </div>
              {currentView === 'executive' ? (
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              ) : (
                <ArrowIcon className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>

          {/* Section: Administration Management Tools */}
          <div className="bg-slate-50/80 p-2.5 rounded-2xl border border-slate-200/80 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-2 py-1">
              {lang === 'ar' ? 'إدارة النظام والمشروع' : 'Administration Management'}
            </p>

            {/* Live User Management with DIRECT UPDATED NUMBER */}
            <button
              onClick={() => {
                setUsersModal(true);
                handleClose();
              }}
              className="w-full p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-white hover:text-indigo-700 hover:shadow-xs border border-transparent hover:border-slate-200 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                  <Users className="w-4 h-4" />
                </div>
                <span>{lang === 'ar' ? 'إدارة المستخدمين' : 'User Management'}</span>
              </div>
              <span className="px-2.5 py-0.5 text-xs font-black rounded-full bg-indigo-600 text-white shadow-2xs min-w-[24px] text-center">
                {liveUsersCount}
              </span>
            </button>

            {/* Live Categories Management with DIRECT UPDATED NUMBER */}
            <button
              onClick={() => {
                setCategoriesModal(true);
                handleClose();
              }}
              className="w-full p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-white hover:text-violet-700 hover:shadow-xs border border-transparent hover:border-slate-200 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-violet-100 text-violet-700">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <span>{lang === 'ar' ? 'إدارة الفئات' : 'Categories Management'}</span>
              </div>
              <span className="px-2.5 py-0.5 text-xs font-black rounded-full bg-violet-600 text-white shadow-2xs min-w-[24px] text-center">
                {liveCategoriesCount}
              </span>
            </button>

            {/* WIP Limit Setting */}
            <button
              onClick={() => {
                setSettingsModal(true);
                handleClose();
              }}
              className="w-full p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-white hover:text-amber-800 hover:shadow-xs border border-transparent hover:border-slate-200 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <span>{lang === 'ar' ? `حد التنفيذ: ${project.wipLimit} ن` : `WIP Limit: ${project.wipLimit} pts`}</span>
              </div>
              <span className="text-[10px] text-amber-800 font-black uppercase px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200">
                {lang === 'ar' ? 'تعديل' : 'Edit'}
              </span>
            </button>
          </div>

          {/* Section: Data Services & Export */}
          <div className="bg-slate-50/80 p-2.5 rounded-2xl border border-slate-200/80 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-2 py-1">
              {lang === 'ar' ? 'التصدير والنسخ الاحتياطي' : 'Export & Backup Services'}
            </p>

            {/* Export Excel/CSV */}
            <button
              onClick={() => {
                handleExportCSV();
                handleClose();
              }}
              className="w-full p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-white hover:text-emerald-700 hover:shadow-xs border border-transparent hover:border-slate-200 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <Download className="w-4 h-4" />
                </div>
                <span>{lang === 'ar' ? 'تصدير Excel/CSV' : 'Export Excel/CSV'}</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                .CSV
              </span>
            </button>

            {/* Full JSON Backup */}
            <button
              onClick={() => {
                handleDownloadBackup();
                handleClose();
              }}
              className="w-full p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-white hover:text-sky-700 hover:shadow-xs border border-transparent hover:border-slate-200 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                  <DownloadCloud className="w-4 h-4" />
                </div>
                <span>{lang === 'ar' ? 'نسخة احتياطية' : 'Take Full Backup'}</span>
              </div>
              <span className="text-[10px] text-sky-700 font-extrabold px-1.5 py-0.5 rounded-md bg-sky-50 border border-sky-200">
                .JSON
              </span>
            </button>

            {/* Restore Backup */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                handleRestoreFileChange(e);
                handleClose();
              }}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-white hover:text-purple-700 hover:shadow-xs border border-transparent hover:border-slate-200 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <span>{lang === 'ar' ? 'استرجاع نسخة' : 'Restore Backup'}</span>
              </div>
              <span className="text-[10px] text-purple-700 font-extrabold px-1.5 py-0.5 rounded-md bg-purple-50 border border-purple-200">
                .JSON
              </span>
            </button>
          </div>

          {/* Section: Session & Danger Zone */}
          <div className="space-y-2 pt-1">
            {/* Logout Button */}
            <button
              onClick={() => {
                handleClose();
                handleLogout();
              }}
              className="w-full p-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 flex items-center justify-between transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-rose-200/80 text-rose-700 group-hover:scale-105 transition-transform">
                  <LogOut className="w-4 h-4" />
                </div>
                <span>{lang === 'ar' ? 'تسجيل الخروج من الأدمن' : 'Logout from Admin'}</span>
              </div>
              <span className="text-[10px] font-black text-rose-600 uppercase px-2 py-0.5 rounded-md bg-white border border-rose-200">
                {lang === 'ar' ? 'خروج' : 'Exit'}
              </span>
            </button>

            {/* Protected Factory Reset */}
            <button
              onClick={() => {
                setResetModal(true);
                handleClose();
              }}
              className="w-full p-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 border border-slate-200 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-slate-500 hover:text-rose-600" />
                <span>{lang === 'ar' ? 'استعادة ضبط المصنع (محمي)' : 'Protected Factory Reset'}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                {lang === 'ar' ? 'بكلمة المرور' : 'Password'}
              </span>
            </button>
          </div>

        </div>

        {/* 4. Drawer Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 shrink-0 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[11px] font-extrabold">
              {isOnline ? (lang === 'ar' ? 'متصل سحابياً (Firestore)' : 'Cloud Connected') : (lang === 'ar' ? 'حفظ محلي' : 'Local Storage')}
            </span>
          </div>

          <button
            onClick={handleClose}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 text-[11px] transition shadow-2xs"
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </aside>
    </>
  );
}

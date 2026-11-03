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
  Database
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

  // Client-side CSV Export
  const handleExportCSV = () => {
    try {
      const isAr = lang === 'ar';
      const headers = isAr
        ? ['المعرف', 'عنوان النشاط (عربي)', 'عنوان النشاط (إنجليزي)', 'المرحلة / القسم', 'الوزن النسبي', 'الحالة', 'تاريخ البدء', 'تاريخ الاستحقاق', 'المسؤول']
        : ['ID', 'Title (AR)', 'Title (EN)', 'Category', 'Weight', 'Status', 'Start Date', 'Due Date', 'Assignee'];

      const statusMap = {
        backlog: isAr ? 'قيد الانتظار' : 'Backlog',
        in_progress: isAr ? 'قيد التنفيذ' : 'In Progress',
        testing: isAr ? 'قيد المراجعة والاختبار' : 'Testing/Review',
        completed: isAr ? 'مكتمل' : 'Completed'
      };

      const categoryMap = {};
      (categories || []).forEach(c => {
        categoryMap[c.key] = isAr ? c.nameAr : c.nameEn;
      });

      const escapeCSV = (val) => {
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      };

      const rows = (tasks || []).map(task => [
        escapeCSV(task.id),
        escapeCSV(task.titleAr || ''),
        escapeCSV(task.titleEn || task.titleAr || ''),
        escapeCSV(categoryMap[task.category] || task.category || ''),
        escapeCSV(task.weight || 1),
        escapeCSV(statusMap[task.status] || task.status),
        escapeCSV(task.startDate || ''),
        escapeCSV(task.dueDate || ''),
        escapeCSV(task.assignedTo || '')
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

  // Full JSON Backup Download
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

  // Restore Backup
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
        className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          adminSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer Container */}
      <aside
        className={`fixed top-0 bottom-0 z-50 w-80 sm:w-96 bg-white shadow-2xl flex flex-col transition-all duration-300 ease-out border-slate-200 ${
          isRtl
            ? `right-0 border-l ${adminSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`
            : `left-0 border-r ${adminSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 tracking-wide">
                  ٢٠٢٦
                </span>
                <span className="text-[11px] font-bold text-slate-300 uppercase">
                  {lang === 'ar' ? 'لوحة تحكم الأدمن' : 'Admin Control'}
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-white mt-0.5 leading-tight truncate max-w-[210px]">
                {lang === 'ar' ? project.titleAr : project.titleEn}
              </h3>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition duration-200"
            title={lang === 'ar' ? 'إغلاق القائمة' : 'Close Menu'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Badge Profile */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
              {currentUser?.fullName?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="font-extrabold text-slate-800 leading-none">
                {currentUser?.fullName || (lang === 'ar' ? 'مدير النظام' : 'Administrator')}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>{lang === 'ar' ? 'صلاحيات كاملة (Admin)' : 'Full Admin Privileges'}</span>
              </span>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {tasks?.length || 0} {lang === 'ar' ? 'أنشطة' : 'tasks'}
          </span>
        </div>

        {/* Scrollable Menu Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* 1. Primary Action: Add New Activity */}
          <div>
            <button
              onClick={() => {
                setTaskModal({ isOpen: true, taskId: null, defaultStatus: 'backlog' });
                handleClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl font-black text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200 flex items-center justify-between transition-all duration-200 transform active:scale-98"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>{lang === 'ar' ? 'نشاط جديد' : 'New Activity'}</span>
              </div>
              <ArrowIcon className="w-4 h-4 opacity-80" />
            </button>
          </div>

          {/* 2. Main Views (Operational Workflow Board, Project Timeline, Executive Summary) */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
              {lang === 'ar' ? 'شاشات العرض والمتابعة' : 'Display Views'}
            </p>

            <button
              onClick={() => {
                setCurrentView('kanban');
                handleClose();
              }}
              className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                currentView === 'kanban'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${currentView === 'kanban' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <Columns4 className="w-4 h-4" />
                </div>
                <span>Operational Workflow Board</span>
              </div>
              {currentView === 'kanban' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
            </button>

            <button
              onClick={() => {
                setCurrentView('timeline');
                handleClose();
              }}
              className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                currentView === 'timeline'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${currentView === 'timeline' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <GanttChart className="w-4 h-4" />
                </div>
                <span>Project Timeline</span>
              </div>
              {currentView === 'timeline' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
            </button>

            <button
              onClick={() => {
                setCurrentView('executive');
                handleClose();
              }}
              className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                currentView === 'executive'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${currentView === 'executive' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <PieChart className="w-4 h-4" />
                </div>
                <span>Executive Summary</span>
              </div>
              {currentView === 'executive' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>

          {/* 3. Administration Management Tools */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
              {lang === 'ar' ? 'إدارة النظام والمشروع' : 'Administration Management'}
            </p>

            {/* Manage Users */}
            <button
              onClick={() => {
                setUsersModal(true);
                handleClose();
              }}
              className="w-full p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-indigo-50/70 hover:text-indigo-700 border border-transparent hover:border-indigo-100 flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                  <Users className="w-4 h-4" />
                </div>
                <span>{lang === 'ar' ? 'إدارة المستخدمين' : 'User Management'}</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                {users?.length || 1}
              </span>
            </button>

            {/* Manage Categories */}
            <button
              onClick={() => {
                setCategoriesModal(true);
                handleClose();
              }}
              className="w-full p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-violet-50/70 hover:text-violet-700 border border-transparent hover:border-violet-100 flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-violet-100 text-violet-700">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <span>{lang === 'ar' ? 'إدارة الفئات' : 'Categories Management'}</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                {categories?.length || 5}
              </span>
            </button>

            {/* WIP Limit Setting */}
            <button
              onClick={() => {
                setSettingsModal(true);
                handleClose();
              }}
              className="w-full p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-amber-50/70 hover:text-amber-800 border border-transparent hover:border-amber-100 flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <span>{lang === 'ar' ? `حد التنفيذ: ${project.wipLimit} ن` : `WIP Limit: ${project.wipLimit} pts`}</span>
              </div>
              <span className="text-[10px] text-amber-700 font-extrabold uppercase">
                {lang === 'ar' ? 'تعديل' : 'Edit'}
              </span>
            </button>
          </div>

          {/* 4. Export & Backup Services */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
              {lang === 'ar' ? 'التصدير والنسخ الاحتياطي' : 'Export & Backup'}
            </p>

            {/* Export Excel/CSV */}
            <button
              onClick={() => {
                handleExportCSV();
                handleClose();
              }}
              className="w-full p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-700 border border-transparent hover:border-emerald-100 flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <Download className="w-4 h-4" />
                </div>
                <span>{lang === 'ar' ? 'تصدير Excel/CSV' : 'Export Excel/CSV'}</span>
              </div>
              <ArrowIcon className="w-4 h-4 text-slate-400" />
            </button>

            {/* Full JSON Backup */}
            <button
              onClick={() => {
                handleDownloadBackup();
                handleClose();
              }}
              className="w-full p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-sky-50/70 hover:text-sky-700 border border-transparent hover:border-sky-100 flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                  <DownloadCloud className="w-4 h-4" />
                </div>
                <span>{lang === 'ar' ? 'نسخة احتياطية' : 'Take Full Backup'}</span>
              </div>
              <span className="text-[10px] text-sky-700 font-extrabold">.JSON</span>
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
              className="w-full p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-purple-50/70 hover:text-purple-700 border border-transparent hover:border-purple-100 flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <span>{lang === 'ar' ? 'استرجاع نسخة' : 'Restore Backup'}</span>
              </div>
              <span className="text-[10px] text-purple-700 font-extrabold">.JSON</span>
            </button>
          </div>

          {/* 5. Danger Zone: Factory Reset */}
          <div className="pt-2">
            <button
              onClick={() => {
                setResetModal(true);
                handleClose();
              }}
              className="w-full p-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>{lang === 'ar' ? 'استعادة ضبط المصنع (محمي)' : 'Protected Factory Reset'}</span>
              </div>
              <span className="text-[10px] font-bold text-rose-500">
                {lang === 'ar' ? 'كلمة المرور' : 'Password'}
              </span>
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] font-bold">
              {isOnline ? (lang === 'ar' ? 'البيانات متصلة سحابياً' : 'Cloud Connected') : (lang === 'ar' ? 'حفظ محلي فوري' : 'Local Storage')}
            </span>
          </div>

          <button
            onClick={handleClose}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 text-[11px] transition"
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </aside>
    </>
  );
}

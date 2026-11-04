import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Kanban,
  SlidersHorizontal,
  RotateCcw,
  Plus,
  Download,
  Calendar,
  Eye,
  PenLine,
  Columns4,
  GanttChart,
  PieChart,
  Users,
  FolderKanban,
  DownloadCloud,
  UploadCloud,
  LogOut,
  RefreshCw
} from 'lucide-react';

export default function Header() {
  const {
    lang,
    t,
    role,
    project,
    tasks,
    categories,
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
    isRefreshing,
    handleManualRefresh
  } = useApp();

  const fileInputRef = useRef(null);
  const isAdmin = role === 'admin';
  const projectTitle = lang === 'en' ? project.titleEn : project.titleAr;

  const today = new Date();
  const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
  const currentDateStr = today.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        
        {/* ROW 1: Project Identity, Official Logo & Primary Operations */}
        <div className="py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
          
          {/* Logo & Project Titles */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Domiatec Official Company Logo */}
            <div className="flex items-center px-2 py-1 bg-white rounded-xl border border-slate-200 shadow-2xs shrink-0">
              <img
                src="/domiatec-logo.png"
                alt="Domiatec Agri-Group"
                className="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Subtle Divider */}
            <div className="h-8 w-px bg-slate-200 hidden sm:block shrink-0" />

            {/* Project Details */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                  ٢٠٢٦
                </span>

                <span className="text-[11px] font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                  {t.systemTag}
                </span>

                {!isAdmin && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1 shrink-0">
                    <Eye className="w-3 h-3" />
                    <span>{t.readOnlyBadge}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <h1
                  onClick={() => isAdmin && setSettingsModal(true)}
                  className={`text-base sm:text-lg font-black text-slate-900 transition flex items-center gap-1.5 ${
                    isAdmin ? 'cursor-pointer hover:text-indigo-600' : ''
                  }`}
                  title={isAdmin ? (lang === 'ar' ? 'انقر لتعديل عنوان المشروع' : 'Click to edit project settings') : ''}
                >
                  <span>{projectTitle}</span>
                  {isAdmin && <PenLine className="w-4 h-4 text-slate-400 hover:text-indigo-600 shrink-0" />}
                </h1>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons on Row 1 */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Date Display */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200/80">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentDateStr}</span>
            </div>

            {/* Instant Cloud Sync Button */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-indigo-700 border border-slate-200 transition shadow-2xs active:scale-95"
              title={lang === 'ar' ? 'تحديث فوري لجميع البيانات والمستجدات من السحابة' : 'Instant sync with cloud'}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{lang === 'ar' ? 'تحديث فوري' : 'Live Sync'}</span>
            </button>

            {/* Admin Controls */}
            {isAdmin && (
              <>
                {/* Admin Animated Sidebar Toggle Button */}
                <button
                  onClick={() => setAdminSidebarOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white shadow-md shadow-indigo-300/30 transition transform hover:scale-102 active:scale-95"
                  title={lang === 'ar' ? 'فتح لوحة تحكم وإدارة النظام' : 'Open Admin Panel'}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}</span>
                </button>

                {/* Quick Add Activity Button */}
                <button
                  onClick={() => setTaskModal({ isOpen: true, taskId: null, defaultStatus: 'backlog' })}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition transform hover:scale-102 active:scale-95"
                  title={t.btnAddActivity}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.btnAddActivity}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ROW 2: Dedicated Navigation Tabs for Views */}
        <div className="py-2 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          {/* The 3 View Tabs */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentView('kanban')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 ${
                currentView === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Columns4 className="w-4 h-4" />
              <span>Operational Workflow Board</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                currentView === 'kanban' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tasks?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setCurrentView('timeline')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 ${
                currentView === 'timeline'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <GanttChart className="w-4 h-4" />
              <span>Project Timeline</span>
            </button>

            <button
              onClick={() => setCurrentView('executive')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 ${
                currentView === 'executive'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Executive Summary</span>
            </button>
          </div>

          {/* Right indicator on row 2 */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>{lang === 'ar' ? 'عرض تفاعلي مباشر' : 'Live Interactive Board'}</span>
          </div>
        </div>

      </div>
    </header>
  );
}

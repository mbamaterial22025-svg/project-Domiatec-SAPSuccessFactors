import React from 'react';
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
  FolderKanban
} from 'lucide-react';

export default function Header() {
  const {
    lang,
    t,
    role,
    project,
    currentView,
    setCurrentView,
    setTaskModal,
    setSettingsModal,
    setUsersModal,
    setCategoriesModal,
    setResetModal
  } = useApp();

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
    window.location.href = api.getCSVUrl(lang);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Brand & Project Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
              <Kanban className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {t.systemTag}
                </span>

                {!isAdmin && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{t.readOnlyBadge}</span>
                  </span>
                )}

                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{currentDateStr}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <h1
                  onClick={() => isAdmin && setSettingsModal(true)}
                  className={`text-lg sm:text-xl font-extrabold text-slate-900 transition flex items-center gap-1.5 ${
                    isAdmin ? 'cursor-pointer hover:text-indigo-600' : ''
                  }`}
                >
                  <span>{projectTitle}</span>
                  {isAdmin && <PenLine className="w-4 h-4 text-slate-400 hover:text-indigo-600" />}
                </h1>
              </div>
            </div>
          </div>

          {/* View Switcher & Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 3 Views: Kanban Board | Timeline | Executive Summary */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
              <button
                onClick={() => setCurrentView('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition ${
                  currentView === 'kanban'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Columns4 className="w-4 h-4" />
                <span>{t.tabKanban}</span>
              </button>

              <button
                onClick={() => setCurrentView('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition ${
                  currentView === 'timeline'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GanttChart className="w-4 h-4" />
                <span>{t.tabTimeline}</span>
              </button>

              <button
                onClick={() => setCurrentView('executive')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition ${
                  currentView === 'executive'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PieChart className="w-4 h-4" />
                <span>{t.tabExecutive}</span>
              </button>
            </div>

            {/* Admin-Only Controls */}
            {isAdmin && (
              <div className="flex flex-wrap items-center gap-2">
                {/* Manage Users Button */}
                <button
                  onClick={() => setUsersModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition"
                  title={t.userManagementTitle}
                >
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">{t.manageUsersBtn}</span>
                </button>

                {/* Manage Categories Button */}
                <button
                  onClick={() => setCategoriesModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 transition"
                  title={t.modalCategoriesTitle}
                >
                  <FolderKanban className="w-4 h-4 text-violet-600" />
                  <span className="hidden sm:inline">{t.manageCategoriesBtn}</span>
                </button>

                {/* WIP Limit & Settings */}
                <button
                  onClick={() => setSettingsModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                >
                  <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                  <span>
                    {t.wipLimitLabel} <strong>{project.wipLimit}</strong> {t.ptShort}
                  </span>
                </button>

                {/* Reset Default Data */}
                <button
                  onClick={() => setResetModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition"
                  title="Reset Default Data"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Add New Activity Button */}
                <button
                  onClick={() => setTaskModal({ isOpen: true, taskId: null, defaultStatus: 'backlog' })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.btnAddActivity}</span>
                </button>
              </div>
            )}

            {/* Export CSV (Both Management & Admin) */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">{t.btnExportCSV}</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}

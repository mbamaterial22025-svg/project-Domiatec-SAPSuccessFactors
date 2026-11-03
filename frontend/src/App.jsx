import React from 'react';
import { useApp } from './context/AppContext';
import RoleBanner from './components/RoleBanner';
import Header from './components/Header';
import KpiMetrics from './components/KpiMetrics';
import FilterBar from './components/FilterBar';
import KanbanBoard from './components/KanbanBoard';
import TimelineView from './components/TimelineView';
import ExecutiveView from './components/ExecutiveView';
import TaskModal from './components/TaskModal';
import SettingsModal from './components/SettingsModal';
import LoginModal from './components/LoginModal';
import UsersModal from './components/UsersModal';
import CategoriesModal from './components/CategoriesModal';
import BackupModal from './components/BackupModal';
import ResetModal from './components/ResetModal';
import AdminSidebar from './components/AdminSidebar';

export default function App() {
  const { currentView } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      {/* Animated Admin Sidebar Drawer */}
      <AdminSidebar />
      {/* Top Banner (Role indicator & switcher, User info, Language toggle) */}
      <RoleBanner />

      {/* Main Header */}
      <Header />

      {/* Main Content Dashboard */}
      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-5 flex-1 flex flex-col gap-5">
        {/* KPI Metrics & Progress */}
        <KpiMetrics />

        {/* Filter and Search Bar */}
        <FilterBar />

        {/* Dynamic View Display */}
        {currentView === 'kanban' && <KanbanBoard />}
        {currentView === 'timeline' && <TimelineView />}
        {currentView === 'executive' && <ExecutiveView />}
      </main>

      {/* Modals */}
      <TaskModal />
      <SettingsModal />
      <LoginModal />
      <UsersModal />
      <CategoriesModal />
      <BackupModal />
      <ResetModal />
    </div>
  );
}

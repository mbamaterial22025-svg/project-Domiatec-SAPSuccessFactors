import React from 'react';
import { useApp } from '../context/AppContext';
import { Search } from 'lucide-react';

export default function FilterBar() {
  const { lang, t, filters, setFilters, tasks, categories } = useApp();

  // Extract unique assignees from tasks
  const assignees = Array.from(
    new Set(
      tasks
        .map(t => (lang === 'en' ? t.assigneeEn || t.assigneeAr : t.assigneeAr || t.assigneeEn))
        .filter(Boolean)
        .map(s => s.trim())
    )
  );

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleCategoryChange = (e) => {
    setFilters(prev => ({ ...prev, category: e.target.value }));
  };

  const handleDeadlineChange = (e) => {
    setFilters(prev => ({ ...prev, deadline: e.target.value }));
  };

  const handleAssigneeChange = (e) => {
    setFilters(prev => ({ ...prev, assignee: e.target.value }));
  };

  return (
    <section className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5 flex-1">
        {/* Search Input */}
        <div className="relative min-w-[210px] flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder={t.searchPlaceholder}
            className="w-full ps-9 pe-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 transition"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={handleCategoryChange}
          className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
        >
          <option value="all">{t.filterAllCategories}</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {lang === 'en' ? cat.nameEn : cat.nameAr}
            </option>
          ))}
        </select>

        {/* Deadline Alert Filter */}
        <select
          value={filters.deadline}
          onChange={handleDeadlineChange}
          className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
        >
          <option value="all">{t.filterAllDeadlines}</option>
          <option value="overdue">{t.filterOverdue}</option>
          <option value="soon">{t.filterSoon}</option>
          <option value="ontrack">{t.filterOnTrack}</option>
        </select>

        {/* Assignee Filter */}
        <select
          value={filters.assignee}
          onChange={handleAssigneeChange}
          className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
        >
          <option value="all">{t.filterAllAssignees}</option>
          {assignees.map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Legend for Alerts */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="hidden xl:inline font-semibold">{t.legendAlertsLabel}</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
          {t.badgeOverdue}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
          {t.badgeDueSoon}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
          {t.badgeOnTrack}
        </span>
      </div>
    </section>
  );
}


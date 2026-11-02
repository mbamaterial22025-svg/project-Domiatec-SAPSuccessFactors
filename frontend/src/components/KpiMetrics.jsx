import React from 'react';
import { useApp } from '../context/AppContext';
import { Layers, Activity, AlertTriangle, Clock } from 'lucide-react';

export default function KpiMetrics() {
  const { t, metrics, project } = useApp();

  const totalPoints = metrics?.totalPoints || 0;
  const donePoints = metrics?.donePoints || 0;
  const reviewPoints = metrics?.reviewPoints || 0;
  const inProgressPoints = metrics?.inProgressPoints || 0;
  const backlogPoints = metrics?.backlogPoints || 0;
  const totalTasks = metrics?.totalTasks || 0;
  const overdueCount = metrics?.overdueCount || 0;
  const overduePoints = metrics?.overduePoints || 0;
  const dueSoonCount = metrics?.dueSoonCount || 0;
  const dueSoonPoints = metrics?.dueSoonPoints || 0;

  const weightedPercent = metrics?.weightedPercent || 0;
  const reviewPercent = metrics?.reviewPercent || 0;
  const progressPercent = metrics?.inProgressPercent || 0;
  const wipLimit = project.wipLimit || 15;

  let wipCardClass = 'bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between transition';
  let wipStatusTextClass = 'text-xs text-emerald-600 font-semibold mt-0.5';
  let wipStatusMessage = t.wipSafe;

  if (inProgressPoints > wipLimit) {
    wipCardClass = 'bg-rose-50/70 rounded-2xl p-4 border-2 border-rose-400 shadow-xs flex flex-col justify-between transition';
    wipStatusTextClass = 'text-xs text-rose-700 font-extrabold mt-0.5';
    wipStatusMessage = `${t.wipExceededBy} ${inProgressPoints - wipLimit} ${t.ptShort}!`;
  } else if (inProgressPoints >= wipLimit * 0.85) {
    wipCardClass = 'bg-amber-50/40 rounded-2xl p-4 border border-amber-300 shadow-xs flex flex-col justify-between transition';
    wipStatusTextClass = 'text-xs text-amber-700 font-bold mt-0.5';
    wipStatusMessage = t.wipNear;
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Overall Weighted Points Progress Card (5 cols on lg) */}
      <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.weightedSubtitle}
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <span>{t.weightedTitle}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                {weightedPercent}%
              </span>
            </h2>
          </div>
          <div className="text-end">
            <div className="text-2xl sm:text-3xl font-black text-indigo-600">
              {donePoints} / {totalPoints}
            </div>
            <div className="text-xs text-slate-500 font-medium">{t.completedPtsUnit}</div>
          </div>
        </div>

        {/* Segmented Progress Bar */}
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex my-2 border border-slate-200/60">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${weightedPercent}%` }}
          />
          <div
            className="bg-amber-400 h-full transition-all duration-500"
            style={{ width: `${reviewPercent}%` }}
          />
          <div
            className="bg-indigo-500 h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>
              {t.statusDone}: <strong>{donePoints}</strong> {t.ptShort}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>
              {t.statusReviewShort}: <strong>{reviewPoints}</strong> {t.ptShort}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
            <span>
              {t.statusProgressShort}: <strong>{inProgressPoints}</strong> {t.ptShort}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
            <span>
              {t.statusBacklogShort}: <strong>{backlogPoints}</strong> {t.ptShort}
            </span>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards (7 cols on lg) */}
      <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Points & Activities */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t.kpiTotalVolume}</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">
              <span>{totalPoints}</span>{' '}
              <span className="text-xs font-bold text-slate-500">{t.pointsWord}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              <span>{t.acrossTasksPrefix} </span>
              <strong className="text-slate-700">{totalTasks}</strong>{' '}
              <span>{t.activitiesWord}</span>
            </div>
          </div>
        </div>

        {/* Active WIP Load */}
        <div className={wipCardClass}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t.kpiWipTitle}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">
              <span>{inProgressPoints}</span>{' '}
              <span className="text-sm font-bold text-slate-400">
                / {wipLimit} {t.ptShort}
              </span>
            </div>
            <div className={wipStatusTextClass}>{wipStatusMessage}</div>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t.kpiOverdueTitle}</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-rose-600">
              <span>{overdueCount}</span>{' '}
              <span className="text-xs font-bold text-slate-500">{t.activitySingular}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              <span>{t.totalWord} </span>
              <strong className="text-rose-600">{overduePoints}</strong>{' '}
              <span>{t.overduePtsSuffix}</span>
            </div>
          </div>
        </div>

        {/* Due Soon (Within 3 Days) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t.kpiDueSoonTitle}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-600">
              <span>{dueSoonCount}</span>{' '}
              <span className="text-xs font-bold text-slate-500">{t.activitySingular}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              <span>{t.totalWord} </span>
              <strong className="text-amber-600">{dueSoonPoints}</strong>{' '}
              <span>{t.urgentPtsSuffix}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


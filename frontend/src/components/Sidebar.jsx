import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HelpCircle,
  Hash,
  Trophy,
  ShieldCheck,
  Flame,
  Bookmark,
  Sparkles,
  Layers
} from 'lucide-react';
import SubjectBadge from './SubjectBadge';
import { useAuth } from '../context/AuthContext';

const subjects = [
  'Computer Networks',
  'DBMS',
  'Web Programming',
  'Graph Theory',
  'Operating Systems',
  'Algorithms & DSA',
  'Artificial Intelligence'
];

export default function Sidebar({ selectedSubject, onSelectSubject }) {
  const { isStaff } = useAuth();
  const location = useLocation();

  return (
    <aside className="w-full md:w-64 shrink-0 space-y-6">
      {/* Navigation Card */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 rounded-2xl p-3 shadow-sm transition-colors">
        <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Navigation
        </p>
        <div className="space-y-1 mt-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive && !selectedSubject
                  ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>All Questions</span>
          </NavLink>

          <NavLink
            to="/tags"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <Hash className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Subject Tags</span>
          </NavLink>

          <NavLink
            to="/leaderboard"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Reputation Board</span>
          </NavLink>

          <NavLink
            to="/saved"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <Bookmark className="w-4 h-4 text-orange-500 dark:text-orange-400" />
            <span>Saved Doubts</span>
          </NavLink>

          {isStaff && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-600/40'
                    : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                }`
              }
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Moderation Desk</span>
            </NavLink>
          )}
        </div>
      </div>

      {/* College Subjects Selector */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Subjects</span>
          </p>
          {selectedSubject && (
            <button
              onClick={() => onSelectSubject && onSelectSubject(null)}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          {subjects.map((sub) => {
            const isSelected = selectedSubject === sub;
            return (
              <button
                key={sub}
                onClick={() => onSelectSubject && onSelectSubject(isSelected ? null : sub)}
                className={`text-left text-xs py-2 px-3 rounded-xl font-medium transition-all flex items-center justify-between border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{sub}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Peer Advice & Reputation Guide */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl p-4 shadow-sm transition-colors">
        <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300 font-semibold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Reputation Rules</span>
        </div>
        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
          <li className="flex items-center justify-between">
            <span>Accepted Answer</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">+15 pts</span>
          </li>
          <li className="flex items-center justify-between">
            <span>Answer Upvote</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">+10 pts</span>
          </li>
          <li className="flex items-center justify-between">
            <span>Question Upvote</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">+5 pts</span>
          </li>
          <li className="flex items-center justify-between">
            <span>Downvote Penalty</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400">-2 pts</span>
          </li>
        </ul>
      </div>
    </aside>
  );
}

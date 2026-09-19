import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  HelpCircle,
  Sparkles,
  Filter,
  CheckCircle2,
  Pin,
  TrendingUp,
  MessageCircleQuestion,
  ChevronLeft,
  ChevronRight,
  Search,
  BookOpen
} from 'lucide-react';
import API from '../services/api';
import QuestionCard from '../components/QuestionCard';
import Sidebar from '../components/Sidebar';
import SubjectBadge from '../components/SubjectBadge';
import ReputationBadge from '../components/ReputationBadge';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Filters from query params
  const currentSubject = searchParams.get('subject') || '';
  const currentTag = searchParams.get('tag') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentFilter = searchParams.get('filter') || 'all';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        filter: currentFilter,
        sort: currentSort,
      };
      if (currentSubject) params.subject = currentSubject;
      if (currentTag) params.tag = currentTag;
      if (currentSearch) params.search = currentSearch;

      const { data } = await API.get('/questions', { params });
      setQuestions(data.questions || []);
      setTotalPages(data.totalPages || 1);
      setTotalQuestions(data.totalQuestions || 0);
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [currentSubject, currentTag, currentSearch, currentFilter, currentSort, currentPage]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    // reset to page 1 on filter changes
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner (Human college feel) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 md:p-8 mb-8 shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-indigo-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Campus Academic Repository & Doubt Solver</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight font-['Outfit']">
            Never stay stuck on a <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-indigo-200 to-emerald-300">college doubt</span>.
          </h1>
          <p className="mt-2 text-sm sm:text-base text-indigo-100/90 leading-relaxed">
            Search verified solutions across <strong>CN, DBMS, Web Dev, Graph Theory & OS</strong>. Peer solutions verified by faculty with reputation rewards.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/ask"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 text-sm font-bold rounded-xl shadow-md transition-all hover:scale-105"
            >
              <MessageCircleQuestion className="w-4 h-4 text-indigo-600" />
              <span>Ask Your Doubts</span>
            </Link>
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-950/60 hover:bg-indigo-950 text-white text-sm font-semibold rounded-xl border border-indigo-700/60 backdrop-blur-sm transition-all"
            >
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Leaderboard</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Sidebar */}
        <Sidebar
          selectedSubject={currentSubject}
          onSelectSubject={(sub) => updateParam('subject', sub)}
        />

        {/* Main Feed */}
        <main className="flex-1 min-w-0">
          {/* Active Filter Chips */}
          {(currentSubject || currentTag || currentSearch) && (
            <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active filters:</span>
              {currentSubject && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-700/40">
                  <span>Subject: {currentSubject}</span>
                  <button onClick={() => updateParam('subject', null)} className="text-indigo-500 hover:text-indigo-800 dark:hover:text-white">✕</button>
                </span>
              )}
              {currentTag && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-700/40 font-mono">
                  <span>Tag: #{currentTag}</span>
                  <button onClick={() => updateParam('tag', null)} className="text-emerald-500 hover:text-emerald-800 dark:hover:text-white">✕</button>
                </span>
              )}
              {currentSearch && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                  <span>Search: "{currentSearch}"</span>
                  <button onClick={() => updateParam('search', null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">✕</button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchParams(new URLSearchParams());
                }}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline ml-auto font-medium"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Filter Bar & Sort Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
            {/* Status Filter Tabs */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 text-xs font-medium">
              {[
                { id: 'all', label: 'All Doubts' },
                { id: 'unanswered', label: 'Unanswered' },
                { id: 'accepted', label: 'Solved' },
                { id: 'pinned', label: 'Pinned' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => updateParam('filter', tab.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    currentFilter === tab.id
                      ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="hidden sm:inline">Sort by:</span>
              <select
                value={currentSort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 shadow-sm"
              >
                <option value="newest">Newest First</option>
                <option value="votes">Highest Votes</option>
                <option value="views">Most Views</option>
                <option value="answers">Most Answers</option>
              </select>
            </div>
          </div>

          {/* Question List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-32 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800" />
              ))}
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-3">
              {questions.map((q) => (
                <QuestionCard
                  key={q._id}
                  question={q}
                  onTagClick={(tag) => updateParam('tag', tag)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <HelpCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No questions found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mt-1 mb-6">
                No doubts match your active filters. Be the first to ask this academic doubt!
              </p>
              <Link
                to="/ask"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md"
              >
                <MessageCircleQuestion className="w-4 h-4" />
                <span>Ask Doubt Now</span>
              </Link>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Page <span className="font-semibold text-slate-900 dark:text-white">{currentPage}</span> of{' '}
                <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span> ({totalQuestions} doubts)
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => updateParam('page', String(currentPage - 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => updateParam('page', String(currentPage + 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

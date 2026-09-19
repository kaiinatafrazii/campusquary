import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import QuestionCard from '../components/QuestionCard';
import Sidebar from '../components/Sidebar';
import { Bookmark, Sparkles, BookOpen, CheckSquare, Search, ArrowRight } from 'lucide-react';

export default function SavedQuestionsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [revisedIds, setRevisedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cq_revised_doubts') || '[]');
    } catch {
      return [];
    }
  });

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await API.get('/auth/saved');
      setSavedQuestions(res.data || []);
    } catch (err) {
      console.error('Failed to load saved questions:', err);
      showToast('Could not load saved doubts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const toggleRevisionCheck = (id) => {
    setRevisedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('cq_revised_doubts', JSON.stringify(next));
      return next;
    });
  };

  const handleUnsave = async (qId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await API.post(`/auth/saved/${qId}`);
      setSavedQuestions((prev) => prev.filter((q) => q._id !== qId));
      showToast('Removed from exam revision vault', 'info');
    } catch (err) {
      showToast('Failed to remove bookmark', 'error');
    }
  };

  const filtered = savedQuestions.filter((q) => {
    const matchesSub = !selectedSubject || q.subject === selectedSubject;
    const matchesSearch =
      !searchQuery ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.tags && q.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesSub && matchesSearch;
  });

  const progressPercent =
    savedQuestions.length > 0
      ? Math.round(
          (savedQuestions.filter((q) => revisedIds.includes(q._id)).length /
            savedQuestions.length) *
            100
        )
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      <div className="flex flex-col md:flex-row gap-8">
        <Sidebar selectedSubject={selectedSubject} onSelectSubject={setSelectedSubject} />

        <main className="flex-1 min-w-0">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden mb-8">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm mb-3">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Exam Preparation & Revision Vault</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Saved Academic Doubts
                </h1>
                <p className="text-white/85 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
                  Bookmarked concepts, counter-examples, and verified faculty solutions saved for your mid-terms and finals.
                </p>
              </div>

              {/* Revision Progress Card */}
              {savedQuestions.length > 0 && (
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-right shrink-0">
                  <div className="text-xs uppercase font-semibold tracking-wider text-white/80">
                    Revision Readiness
                  </div>
                  <div className="text-3xl font-black mt-1">{progressPercent}%</div>
                  <div className="w-36 h-2 bg-white/20 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="text-xs text-white/75 mt-1.5">
                    {savedQuestions.filter((q) => revisedIds.includes(q._id)).length} of{' '}
                    {savedQuestions.length} reviewed
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved doubts by title or tag..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm"
              />
            </div>
            {selectedSubject && (
              <button
                onClick={() => setSelectedSubject(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 self-start sm:self-auto"
              >
                Clear Subject Filter
              </button>
            )}
          </div>

          {/* List Content */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 animate-pulse"
                >
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-2/3 mb-3" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-full mb-2" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center mx-auto text-amber-500 mb-4">
                <Bookmark className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {savedQuestions.length === 0
                  ? 'No saved doubts yet'
                  : 'No doubts match your search'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                {savedQuestions.length === 0
                  ? 'When exploring academic discussions, click the Bookmark icon on any question to add it to your revision checklist.'
                  : 'Try adjusting your search terms or clearing the subject filter.'}
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
              >
                <span>Browse Questions</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((q) => {
                const isRevised = revisedIds.includes(q._id);
                return (
                  <div
                    key={q._id}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm transition-all ${
                      isRevised
                        ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/20 dark:bg-emerald-950/10'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {q.subject}
                          </span>
                          {q.hasAcceptedAnswer && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                              ✓ Solved
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            {q.answersCount || 0} answers
                          </span>
                        </div>

                        <Link
                          to={`/questions/${q._id}`}
                          className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2"
                        >
                          {q.title}
                        </Link>

                        <div className="flex flex-wrap items-center gap-1.5 mt-3">
                          {(q.tags || []).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                        <button
                          onClick={() => toggleRevisionCheck(q._id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            isRevised
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                          }`}
                          title="Toggle revision status"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>{isRevised ? 'Revised' : 'Mark Revised'}</span>
                        </button>

                        <button
                          onClick={(e) => handleUnsave(q._id, e)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Remove from saved"
                        >
                          <Bookmark className="w-4 h-4 fill-amber-500 text-amber-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Hash, Search, HelpCircle, Layers } from 'lucide-react';
import API from '../services/api';
import SubjectBadge from '../components/SubjectBadge';

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const fetchTags = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedSubject !== 'All') params.subject = selectedSubject;
      const { data } = await API.get('/tags', { params });
      setTags(data);
    } catch (err) {
      console.error('Error fetching tags:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [search, selectedSubject]);

  const subjects = [
    'All',
    'Computer Networks',
    'DBMS',
    'Web Programming',
    'Graph Theory',
    'Operating Systems',
    'Algorithms & DSA'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Hash className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Academic Subject Tags
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Tags categorize questions into syllabus topics. Click on any tag to review all archived doubts, formulas, and verified solutions.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags (e.g. dijkstra, tcp)..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-sm"
          />
        </div>

        {/* Subject Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white shadow-sm'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Tags Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse h-36 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : tags.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tags.map((tag) => (
            <Link
              key={tag._id || tag.name}
              to={`/?tag=${tag.name}`}
              className="group bg-white dark:bg-slate-900/80 hover:bg-slate-50/80 dark:hover:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/40 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors">
                    #{tag.name}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    {tag.questionCount || 0} doubts
                  </span>
                </div>

                <div className="mb-2">
                  <SubjectBadge subject={tag.subject || 'General Doubts'} size="sm" />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mt-2">
                  {tag.description || `Academic doubts and discussion related to ${tag.name}`}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-800 dark:group-hover:text-indigo-300">
                Explore Questions →
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <HelpCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No tags found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try a different search query or subject.</p>
        </div>
      )}
    </div>
  );
}

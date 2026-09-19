import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HelpCircle,
  Sparkles,
  ArrowLeft,
  Tag as TagIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import MarkdownEditor from '../components/MarkdownEditor';

const subjects = [
  'Computer Networks',
  'DBMS',
  'Web Programming',
  'Graph Theory',
  'Operating Systems',
  'Algorithms & DSA',
  'Artificial Intelligence',
  'Software Engineering',
  'General Doubts'
];

export default function AskQuestionPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Networks');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (clean && !tags.includes(clean)) {
        if (tags.length >= 5) {
          setError('Maximum 5 tags allowed');
          return;
        }
        setTags([...tags, clean]);
        setTagInput('');
        setError('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please fill in both the title and question details');
      return;
    }

    if (tags.length === 0) {
      setError('Please add at least one subject tag (e.g. cn, dbms, react)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const { data } = await API.post('/questions', {
        title: title.trim(),
        subject,
        description: description.trim(),
        tags
      });
      navigate(`/questions/${data._id}`);
    } catch (err) {
      console.error('Error posting question:', err);
      setError(err.response?.data?.message || 'Failed to submit doubt');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center shadow-lg">
        <HelpCircle className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">Student Login Required</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 mb-6">
          You need an active college account to ask doubts, submit answers, and earn reputation points.
        </p>
        <Link
          to="/login"
          className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md"
        >
          Sign In With College ID
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Cancel and go back</span>
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form Container */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
              Ask an Academic Doubt
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Be specific about your theory doubt, lab problem, or algorithm question.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 rounded-xl text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-1">
                Question Title
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Imagine you are asking a professor or senior directly.
              </p>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Why does Dijkstra's Algorithm fail with negative edge weights in Graph Theory?"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                maxLength={180}
              />
              <div className="flex justify-between items-center text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 font-mono">
                <span>Keep it under 180 characters</span>
                <span>{title.length}/180</span>
              </div>
            </div>

            {/* Subject Dropdown */}
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-1">
                College Subject / Domain
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Helps batchmates and subject faculty find your query faster.
              </p>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Description in Markdown */}
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-1">
                Explanation & Details
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Include what you tried, code blocks, textbook formulas, or error traces.
              </p>
              <MarkdownEditor
                value={description}
                onChange={setDescription}
                placeholder="Detail your question here. Include any error logs or code snippets..."
                minRows={8}
              />
            </div>

            {/* Tags Input */}
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-1">
                Tags (Up to 5)
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Press Enter or comma after each tag (e.g. <code>cn</code>, <code>tcp-ip</code>, <code>b-plus-tree</code>).
              </p>

              {/* Tag pills */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-mono border border-indigo-200 dark:border-indigo-700/50 font-medium"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-indigo-500 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-white"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag name and press Enter..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                You will receive <strong>+5 reputation</strong> for posting this question.
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
              >
                {loading ? 'Submitting Doubt...' : 'Publish Question'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Advice Card */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Campus Doubt Guidelines</span>
            </h3>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Specify your subject (CN, DBMS, Web Dev, etc.) correctly.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Use code blocks (```) for programming errors and scripts.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>State what you already tried or read in textbook slides.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Mark the best answer once your doubt is resolved to grant +15 reputation to the solver.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

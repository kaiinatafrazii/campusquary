import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, MessageSquare, Eye, Pin, ThumbsUp, Bookmark } from 'lucide-react';
import SubjectBadge from './SubjectBadge';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function QuestionCard({ question, onTagClick }) {
  const { user, updateUser, isAuthenticated } = useAuth();
  const {
    _id,
    title,
    description,
    subject,
    tags = [],
    authorName = 'Student',
    authorRole = 'student',
    authorAvatar,
    views = 0,
    voteScore = 0,
    answersCount = 0,
    hasAcceptedAnswer = false,
    isPinned = false,
    createdAt
  } = question;

  const isSaved = (user?.savedQuestions || []).includes(String(_id));
  const [saving, setSaving] = useState(false);

  const handleToggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please sign in to save doubts to your exam revision list.');
      return;
    }
    try {
      setSaving(true);
      const { data } = await API.post(`/auth/saved/${_id}`);
      updateUser({ savedQuestions: data.savedQuestions });
    } catch (err) {
      console.error('Bookmark error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Relative time string
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'recently';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Strip markdown symbols for clean snippet
  const plainTextSnippet = description
    ? description.replace(/[#*`_>\[\]]/g, '').slice(0, 160)
    : '';

  return (
    <div
      className={`relative group rounded-2xl transition-all duration-200 border p-5 ${
        isPinned
          ? 'bg-indigo-50/40 dark:bg-gradient-to-r dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 border-indigo-200 dark:border-indigo-500/40 shadow-sm'
          : 'bg-white dark:bg-slate-900/70 hover:bg-slate-50/80 dark:hover:bg-slate-900 border-slate-200/90 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Top right actions (Pinned Marker & Bookmark) */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {isPinned && (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-700/50">
            <Pin className="w-3 h-3" />
            <span className="hidden sm:inline">Pinned Guide</span>
          </div>
        )}
        <button
          onClick={handleToggleBookmark}
          disabled={saving}
          title={isSaved ? 'Remove from saved revision doubts' : 'Save doubt for exam revision'}
          className={`p-1.5 rounded-lg border transition-all ${
            isSaved
              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Metric Counters (Desktop left / Mobile top) */}
        <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 sm:gap-2 text-xs font-mono shrink-0 w-full sm:w-20 pt-1 border-b sm:border-b-0 pb-2 sm:pb-0 border-slate-100 dark:border-slate-800">
          {/* Votes */}
          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300" title={`${voteScore} votes`}>
            <ThumbsUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-sm">{voteScore}</span>
            <span className="sm:hidden text-slate-400">votes</span>
          </div>

          {/* Answers */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
              hasAcceptedAnswer
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-600/50 font-bold'
                : answersCount > 0
                ? 'text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60'
                : 'text-slate-400 dark:text-slate-500'
            }`}
            title={hasAcceptedAnswer ? 'Answered with accepted solution' : `${answersCount} answers`}
          >
            {hasAcceptedAnswer ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <MessageSquare className="w-3.5 h-3.5" />
            )}
            <span className="font-bold text-sm">{answersCount}</span>
            <span className="sm:hidden text-slate-400">ans</span>
          </div>

          {/* Views */}
          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500" title={`${views} views`}>
            <Eye className="w-3.5 h-3.5" />
            <span>{views}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 pr-8 sm:pr-12">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <SubjectBadge subject={subject} size="sm" />
          </div>

          <Link to={`/questions/${_id}`} className="block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
              {title}
            </h3>
          </Link>

          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {plainTextSnippet}...
          </p>

          {/* Tags & Author Meta */}
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={(e) => {
                    e.preventDefault();
                    if (onTagClick) onTagClick(tag);
                  }}
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono text-indigo-700 dark:text-indigo-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-slate-200 dark:border-slate-700/60 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>

            {/* Author */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0 ml-auto">
              <img
                src={authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${authorName}`}
                alt={authorName}
                className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 object-cover"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">{authorName}</span>
              {authorRole === 'faculty' && (
                <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 rounded border border-purple-200 dark:border-purple-700/50">
                  Faculty
                </span>
              )}
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-slate-400 dark:text-slate-500">{formatTimeAgo(createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

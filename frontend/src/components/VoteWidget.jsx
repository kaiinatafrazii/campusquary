import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function VoteWidget({
  initialScore = 0,
  upvotes = [],
  downvotes = [],
  onVote,
  orientation = 'vertical', // 'vertical' or 'horizontal'
  size = 'md'
}) {
  const { user, isAuthenticated } = useAuth();
  const userId = user?._id ? String(user._id) : null;

  const [score, setScore] = useState(initialScore);
  const [currentVote, setCurrentVote] = useState(() => {
    if (!userId) return null;
    if (upvotes.some(id => String(id) === userId)) return 'up';
    if (downvotes.some(id => String(id) === userId)) return 'down';
    return null;
  });
  const [loading, setLoading] = useState(false);

  const handleVote = async (type) => {
    if (!isAuthenticated) {
      alert('Please log in with your college account to vote on questions and answers.');
      return;
    }
    if (loading) return;

    // Optimistic calculation
    const prevVote = currentVote;
    const prevScore = score;

    let newVote = null;
    let scoreDelta = 0;

    if (type === 'up') {
      if (prevVote === 'up') {
        newVote = null;
        scoreDelta = -1;
      } else if (prevVote === 'down') {
        newVote = 'up';
        scoreDelta = +2;
      } else {
        newVote = 'up';
        scoreDelta = +1;
      }
    } else if (type === 'down') {
      if (prevVote === 'down') {
        newVote = null;
        scoreDelta = +1;
      } else if (prevVote === 'up') {
        newVote = 'down';
        scoreDelta = -2;
      } else {
        newVote = 'down';
        scoreDelta = -1;
      }
    }

    setCurrentVote(newVote);
    setScore(prevScore + scoreDelta);

    try {
      setLoading(true);
      const res = await onVote(type);
      if (res && res.voteScore !== undefined) {
        setScore(res.voteScore);
        setCurrentVote(res.userVote);
      }
    } catch (err) {
      setCurrentVote(prevVote);
      setScore(prevScore);
      console.error('Vote error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isVertical = orientation === 'vertical';

  return (
    <div
      className={`flex ${isVertical ? 'flex-col items-center' : 'items-center gap-1'} bg-slate-100/90 dark:bg-slate-900/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors`}
    >
      <button
        onClick={() => handleVote('up')}
        title="This doubt or answer is useful and well researched"
        className={`p-1.5 rounded-lg transition-all ${
          currentVote === 'up'
            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold scale-110'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
        }`}
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      <span
        className={`font-mono font-bold transition-colors ${
          currentVote === 'up'
            ? 'text-emerald-600 dark:text-emerald-400'
            : currentVote === 'down'
            ? 'text-rose-600 dark:text-rose-400'
            : score > 0
            ? 'text-indigo-600 dark:text-indigo-300'
            : 'text-slate-600 dark:text-slate-400'
        } ${isVertical ? 'my-0.5 text-sm md:text-base' : 'px-1.5 text-sm'}`}
      >
        {score}
      </span>

      <button
        onClick={() => handleVote('down')}
        title="This question or answer is unclear or inaccurate"
        className={`p-1.5 rounded-lg transition-all ${
          currentVote === 'down'
            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold scale-110'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
        }`}
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
}

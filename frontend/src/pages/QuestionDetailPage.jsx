import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MessageSquare,
  Eye,
  Calendar,
  Share2,
  CheckCircle2,
  Pin,
  Trash2,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Send,
  Bookmark
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SubjectBadge from '../components/SubjectBadge';
import ReputationBadge from '../components/ReputationBadge';
import VoteWidget from '../components/VoteWidget';
import MarkdownViewer from '../components/MarkdownViewer';
import MarkdownEditor from '../components/MarkdownEditor';
import AnswerCard from '../components/AnswerCard';

export default function QuestionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated, isFaculty, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingBookmark, setSavingBookmark] = useState(false);

  const isSaved = (user?.savedQuestions || []).includes(String(id));

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to bookmark doubts for exam revision.', 'info');
      return;
    }
    try {
      setSavingBookmark(true);
      const { data } = await API.post(`/auth/saved/${id}`);
      updateUser({ savedQuestions: data.savedQuestions });
      showToast(data.message, 'success');
    } catch (err) {
      console.error('Bookmark toggle error:', err);
      showToast('Failed to update bookmark', 'error');
    } finally {
      setSavingBookmark(false);
    }
  };

  const handleShareLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      showToast('Doubt link copied to clipboard! 📋', 'success');
    } catch {
      showToast('Could not copy link', 'error');
    }
  };

  // New answer state
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/questions/${id}`);
      setQuestion(data);
    } catch (err) {
      console.error('Error fetching question:', err);
      setError(err.response?.data?.message || 'Question not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  // Handle Question Vote
  const handleQuestionVote = async (type) => {
    const { data } = await API.post(`/questions/${id}/vote`, { voteType: type });
    setQuestion((prev) => ({
      ...prev,
      voteScore: data.voteScore,
      upvotes: data.upvotes,
      downvotes: data.downvotes
    }));
    return data;
  };

  // Handle Question Pin Toggle
  const handleTogglePin = async () => {
    try {
      const { data } = await API.put(`/questions/${id}/pin`);
      setQuestion((prev) => ({ ...prev, isPinned: data.isPinned }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update pin status');
    }
  };

  // Handle Question Delete
  const handleDeleteQuestion = async () => {
    if (!window.confirm('Are you sure you want to delete this question and all its answers?')) return;
    try {
      await API.delete(`/questions/${id}`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete question');
    }
  };

  // Handle Submit Answer
  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answerContent.trim()) return;

    try {
      setSubmittingAnswer(true);
      const { data: newAnswer } = await API.post(`/questions/${id}/answers`, {
        content: answerContent
      });

      setQuestion((prev) => ({
        ...prev,
        answersCount: (prev.answersCount || 0) + 1,
        answers: [...(prev.answers || []), newAnswer]
      }));

      setAnswerContent('');
      showToast('Answer submitted successfully! (+10 reputation awarded)', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit answer', 'error');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Handle Answer Vote
  const handleAnswerVote = async (answerId, type) => {
    const { data } = await API.post(`/answers/${answerId}/vote`, { voteType: type });
    setQuestion((prev) => ({
      ...prev,
      answers: prev.answers.map((a) =>
        a._id === answerId
          ? { ...a, voteScore: data.voteScore, upvotes: data.upvotes, downvotes: data.downvotes }
          : a
      )
    }));
    return data;
  };

  // Handle Accept Answer
  const handleAcceptAnswer = async (answerId) => {
    try {
      const { data } = await API.put(`/answers/${answerId}/accept`);
      setQuestion((prev) => {
        const updatedAnswers = prev.answers.map((a) => {
          if (a._id === answerId) {
            return data.answer;
          }
          // If this answer was newly accepted, unmark others
          return data.answer.isAccepted ? { ...a, isAccepted: false } : a;
        });
        return {
          ...prev,
          hasAcceptedAnswer: data.answer.isAccepted,
          answers: updatedAnswers
        };
      });
      showToast(data.message || 'Answer marked as accepted solution (+15 reputation)', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to accept answer', 'error');
    }
  };

  // Handle Faculty Endorse
  const handleEndorseAnswer = async (answerId) => {
    try {
      const { data } = await API.put(`/answers/${answerId}/endorse`);
      setQuestion((prev) => ({
        ...prev,
        answers: prev.answers.map((a) => (a._id === answerId ? data : a))
      }));
      showToast(data.isFacultyEndorsed ? 'Answer endorsed by faculty! ⭐' : 'Endorsement removed', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to endorse answer', 'error');
    }
  };

  // Handle Delete Answer
  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm('Delete this answer?')) return;
    try {
      await API.delete(`/answers/${answerId}`);
      setQuestion((prev) => ({
        ...prev,
        answersCount: Math.max(0, (prev.answersCount || 1) - 1),
        answers: prev.answers.filter((a) => a._id !== answerId)
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete answer');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Question Not Found</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{error || 'This question might have been removed.'}</p>
        <Link to="/" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md">
          Back to Questions
        </Link>
      </div>
    );
  }

  const isQuestionOwner = user?._id && String(question.author) === String(user._id);
  const canManageQuestion = isQuestionOwner || isAdmin || isFaculty;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to discussions</span>
      </button>

      {/* Question Header & Body */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden transition-colors">
        {/* Pinned notice */}
        {question.isPinned && (
          <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-700/50 text-xs font-semibold">
            <Pin className="w-3.5 h-3.5" />
            <span>Pinned Faculty / Department Guide</span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug font-['Outfit']">
          {question.title}
        </h1>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          <SubjectBadge subject={question.subject} size="md" />

          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>{question.views || 0} views</span>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Asked {new Date(question.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Question Moderation & Save Actions */}
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={handleToggleBookmark}
              disabled={savingBookmark}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                isSaved
                  ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/40 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved in Revision' : 'Save for Exams'}</span>
            </button>

            <button
              onClick={handleShareLink}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all"
              title="Copy shareable link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {(isAdmin || isFaculty) && (
              <button
                onClick={handleTogglePin}
                className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                <Pin className="w-3.5 h-3.5" />
                <span>{question.isPinned ? 'Unpin' : 'Pin Question'}</span>
              </button>
            )}

            {canManageQuestion && (
              <button
                onClick={handleDeleteQuestion}
                className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mt-6 flex items-start gap-5">
          {/* Vote widget */}
          <div className="shrink-0 pt-1">
            <VoteWidget
              initialScore={question.voteScore}
              upvotes={question.upvotes}
              downvotes={question.downvotes}
              onVote={handleQuestionVote}
              orientation="vertical"
            />
          </div>

          {/* Description */}
          <div className="flex-1 min-w-0">
            <div className="text-slate-800 dark:text-slate-200 leading-relaxed">
              <MarkdownViewer content={question.description} />
            </div>

            {/* Tags */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {question.tags?.map((t) => (
                <Link
                  key={t}
                  to={`/?tag=${t}`}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono text-indigo-700 dark:text-indigo-300 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  #{t}
                </Link>
              ))}
            </div>

            {/* Author details box */}
            <div className="mt-8 flex items-center justify-end">
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex items-center gap-3">
                <img
                  src={question.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${question.authorName}`}
                  alt={question.authorName}
                  className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 object-cover"
                />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Asked by</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{question.authorName}</p>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{question.authorRole}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="mt-12 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              {question.answersCount || question.answers?.length || 0} Peer & Faculty Answers
            </h2>
          </div>
          {question.hasAcceptedAnswer && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-700/40 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Solved Problem</span>
            </span>
          )}
        </div>

        {/* Answers List */}
        {question.answers && question.answers.length > 0 ? (
          <div className="space-y-4">
            {question.answers.map((answer) => (
              <AnswerCard
                key={answer._id}
                answer={answer}
                isQuestionOwner={isQuestionOwner}
                onVote={handleAnswerVote}
                onAccept={handleAcceptAnswer}
                onEndorse={handleEndorseAnswer}
                onDelete={handleDeleteAnswer}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
            <p className="text-slate-800 dark:text-slate-300 font-semibold">No answers yet!</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Know the answer? Help your college batchmates and earn +10 reputation points.
            </p>
          </div>
        )}

        {/* Write Answer Box */}
        <div className="mt-10 bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] mb-2 flex items-center gap-2">
            <span>Write Your Solution</span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
              +10 Reputation
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Provide clear step-by-step reasoning, mathematical proof, or clean code snippets.
          </p>

          {isAuthenticated ? (
            <form onSubmit={handleAnswerSubmit} className="space-y-4">
              <MarkdownEditor
                value={answerContent}
                onChange={setAnswerContent}
                placeholder="Type your explanation here. Use ```cpp, ```python or ```java for code blocks."
                minRows={6}
              />

              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Posting as <strong className="text-slate-800 dark:text-slate-300">{user.name}</strong> ({user.role})
                </p>
                <button
                  type="submit"
                  disabled={submittingAnswer || !answerContent.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
                >
                  <Send className="w-4 h-4" />
                  <span>{submittingAnswer ? 'Posting Solution...' : 'Post Solution'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 text-center bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-3">
                Log in to answer this doubt and build your academic reputation.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700"
                >
                  Create Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

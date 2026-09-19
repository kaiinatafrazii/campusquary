import React, { useState } from 'react';
import { CheckCircle, ShieldCheck, Trash2, Check, Star, MessageSquare, Send, CornerDownRight } from 'lucide-react';
import MarkdownViewer from './MarkdownViewer';
import VoteWidget from './VoteWidget';
import ReputationBadge from './ReputationBadge';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function AnswerCard({
  answer,
  isQuestionOwner,
  onVote,
  onAccept,
  onEndorse,
  onDelete
}) {
  const { user, isFaculty, isAdmin, isAuthenticated } = useAuth();
  const userId = user?._id ? String(user._id) : null;

  const {
    _id,
    content,
    authorName = 'Student',
    authorRole = 'student',
    authorAvatar,
    authorReputation = 0,
    authorBranch = 'CSE',
    voteScore = 0,
    upvotes = [],
    downvotes = [],
    isAccepted = false,
    isFacultyEndorsed = false,
    comments: initialComments = [],
    createdAt
  } = answer;

  const [comments, setComments] = useState(initialComments);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const isAuthor = userId && String(answer.author) === userId;
  const canDelete = isAuthor || isAdmin || isFaculty;
  const canAccept = isQuestionOwner || isAdmin || isFaculty;

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      const res = await API.post(`/answers/${_id}/comments`, { content: commentText.trim() });
      setComments(res.data);
      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await API.delete(`/answers/${_id}/comments/${commentId}`);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <div
      id={`answer-${_id}`}
      className={`rounded-2xl transition-all duration-200 border p-5 ${
        isAccepted
          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/50 shadow-md shadow-emerald-500/5'
          : 'bg-white dark:bg-slate-900/70 border-slate-200/90 dark:border-slate-800 shadow-sm'
      }`}
    >
      {/* Accepted Banner */}
      {isAccepted && (
        <div className="flex items-center gap-2 mb-3 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-300 dark:border-emerald-600/40 text-xs font-semibold w-fit">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Accepted Best Solution</span>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Voting & Accept Toggle Widget */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <VoteWidget
            initialScore={voteScore}
            upvotes={upvotes}
            downvotes={downvotes}
            onVote={(type) => onVote(_id, type)}
            orientation="vertical"
          />

          {/* Accept Button for Question Owner / Faculty */}
          {canAccept && (
            <button
              onClick={() => onAccept(_id)}
              title={isAccepted ? 'Click to unmark as accepted answer' : 'Mark as Accepted Best Solution (+15 reputation to author)'}
              className={`p-2 rounded-xl transition-all ${
                isAccepted
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-500/30 hover:bg-emerald-500'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Answer Content */}
        <div className="flex-1 min-w-0">
          <div className="text-slate-800 dark:text-slate-200">
            <MarkdownViewer content={content} />
          </div>

          {/* Footer Meta & Controls */}
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            {/* Action Badges & Moderation */}
            <div className="flex items-center gap-3">
              {isFacultyEndorsed && (
                <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-700/50">
                  <Star className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  <span>Faculty Endorsed</span>
                </div>
              )}

              {isFaculty && (
                <button
                  onClick={() => onEndorse(_id)}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium"
                >
                  {isFacultyEndorsed ? 'Remove Endorsement' : 'Endorse Solution'}
                </button>
              )}

              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{comments.length > 0 ? `${comments.length} Comments` : 'Comment'}</span>
              </button>

              {canDelete && (
                <button
                  onClick={() => onDelete(_id)}
                  className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  title="Delete answer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Author Information Card */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/50 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800/60 ml-auto">
              <img
                src={authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${authorName}`}
                alt={authorName}
                className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 object-cover"
              />
              <div className="text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 dark:text-slate-200">{authorName}</span>
                  {authorRole === 'faculty' && (
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-950 px-1.5 py-0.2 rounded border border-purple-200 dark:border-purple-800/50">
                      Faculty
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{authorBranch}</span>
                  <span>•</span>
                  <ReputationBadge points={authorReputation} size="sm" showLabel={false} />
                  <span>•</span>
                  <span>{formatTime(createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Micro-Comments Section */}
          {showComments && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              {comments.length > 0 && (
                <div className="space-y-2 pl-2 sm:pl-4 border-l-2 border-slate-200 dark:border-slate-800">
                  {comments.map((c) => {
                    const canDelComment =
                      userId &&
                      (String(c.author) === userId || isAdmin || isFaculty);

                    return (
                      <div
                        key={c._id}
                        className="group text-xs text-slate-700 dark:text-slate-300 flex items-start justify-between gap-2 py-1"
                      >
                        <div className="leading-relaxed">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 mr-1.5">
                            {c.authorName}
                            {c.authorRole === 'faculty' && (
                              <span className="ml-1 text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                                [Faculty]
                              </span>
                            )}
                            :
                          </span>
                          <span>{c.content}</span>
                          <span className="ml-2 text-[10px] text-slate-400">
                            {formatTime(c.createdAt)}
                          </span>
                        </div>

                        {canDelComment && (
                          <button
                            onClick={() => handleDeleteComment(c._id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-0.5 transition-opacity"
                            title="Delete comment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Comment Input */}
              {isAuthenticated ? (
                <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
                  <CornerDownRight className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Ask a clarifying question or add a short remark..."
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || isSubmittingComment}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-all flex items-center gap-1 shrink-0"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send</span>
                  </button>
                </form>
              ) : (
                <p className="text-[11px] text-slate-400 pl-4">
                  Log in to join this answer discussion.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


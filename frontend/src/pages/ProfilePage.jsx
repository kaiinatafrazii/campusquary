import React, { useState, useEffect } from 'react';
import { User, Award, BookOpen, MessageSquare, Edit2, Check, Sparkles, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import QuestionCard from '../components/QuestionCard';
import ReputationBadge from '../components/ReputationBadge';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('my_questions'); // 'my_questions' or 'saved_revision'
  const [myQuestions, setMyQuestions] = useState([]);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    branch: user?.branch || '',
    semester: user?.semester || ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [qRes, savedRes] = await Promise.all([
          API.get('/questions', { params: { limit: 50 } }),
          API.get('/auth/saved').catch(() => ({ data: [] }))
        ]);
        
        const mine = (qRes.data.questions || []).filter(
          (q) => String(q.author?._id || q.author) === String(user?._id)
        );
        setMyQuestions(mine);
        setSavedQuestions(savedRes.data || []);
      } catch (err) {
        console.error('Error fetching profile doubts:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchProfileData();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put('/auth/profile', formData);
      updateUser(data);
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 relative transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
              alt={user.name}
              className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 object-cover border-2 border-indigo-500/40 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{user.email}</p>
              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-2">
                <span>{user.branch}</span>
                <span>•</span>
                <span>{user.semester}</span>
                {user.rollNo && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-400 dark:text-slate-500">{user.rollNo}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
            <ReputationBadge points={user.reputation || 0} size="md" />
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleUpdate} className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Display Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Branch / Department</label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200"
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Semester</label>
                <input
                  type="text"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Badges List */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold mr-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Honors & Badges:</span>
          </span>
          {user.badges?.map((badge) => (
            <span
              key={badge}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-600/40"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('my_questions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'my_questions'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Academic Doubts ({myQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved_revision')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'saved_revision'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Revision List ({savedQuestions.length})</span>
        </button>
      </div>

      {/* Content List */}
      <div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : activeTab === 'my_questions' ? (
          myQuestions.length > 0 ? (
            <div className="space-y-3">
              {myQuestions.map((q) => (
                <QuestionCard key={q._id} question={q} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-sm">You haven't asked any doubts yet.</p>
            </div>
          )
        ) : (
          savedQuestions.length > 0 ? (
            <div className="space-y-3">
              {savedQuestions.map((q) => (
                <QuestionCard key={q._id} question={q} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <Bookmark className="w-8 h-8 text-amber-500/60 mx-auto mb-2" />
              <p className="text-slate-800 dark:text-slate-300 font-semibold text-sm">No saved doubts for revision yet</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                Click the bookmark icon on any question to add it to your exam revision list.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

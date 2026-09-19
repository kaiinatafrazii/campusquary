import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  HelpCircle,
  MessageSquare,
  CheckCircle,
  Percent,
  Trash2,
  Ban,
  Check,
  AlertTriangle,
  Pin
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReputationBadge from '../components/ReputationBadge';

export default function AdminPage() {
  const { user, isAdmin, isFaculty } = useAuth();
  const [stats, setStats] = useState(null);
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'users'

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        isAdmin ? API.get('/admin/users') : Promise.resolve({ data: [] })
      ]);
      setStats(statsRes.data);
      if (usersRes.data) setUserList(usersRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole });
      setUserList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleBanToggle = async (userId) => {
    try {
      const { data } = await API.put(`/admin/users/${userId}/ban`);
      setUserList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isBanned: data.isBanned } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  if (!isAdmin && !isFaculty) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">Access Restricted</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
          This area is restricted to college faculty members and system administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
              {isAdmin ? 'Campus Administration Control Center' : 'Faculty Moderation Desk'}
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor knowledge base health, resolve spam, and manage academic departments.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Analytics & Overview
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'users'
                  ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              User Management ({userList.length})
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm" />
          ))}
        </div>
      ) : activeTab === 'analytics' ? (
        <div className="space-y-8">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Questions</span>
                <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono mt-3">{stats?.totalQuestions || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Academic doubts filed</p>
            </div>

            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Answers</span>
                <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono mt-3">{stats?.totalAnswers || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Peer & faculty contributions</p>
            </div>

            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Doubt Resolution</span>
                <Percent className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono mt-3">{stats?.resolutionRate || 0}%</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{stats?.resolvedQuestions} resolved with accepted answers</p>
            </div>

            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">College Scholars</span>
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono mt-3">{stats?.totalUsers || 0}</p>
              <p className="text-xs text-slate-500 mt-1">{stats?.totalStudents} Students • {stats?.totalFaculty} Faculty</p>
            </div>
          </div>

          {/* Top Subjects & Moderation Guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Top Syllabus Tags</h3>
              <div className="space-y-3">
                {stats?.topTags?.map((tag) => (
                  <div key={tag.name} className="flex items-center justify-between text-xs p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-700 dark:text-indigo-300 font-semibold">#{tag.name}</span>
                      <span className="text-slate-500 dark:text-slate-400">({tag.subject})</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {tag.questionCount || 0} doubts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Faculty Guidelines</h3>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Endorse answers:</strong> Look for accurate proofs in Graph Theory and OS, and click "Endorse Solution" to guide juniors.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Pin syllabus guides:</strong> Pin crucial exam solutions or lab setups directly to the top of the feed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Spam removal:</strong> Delete off-topic or abusive posts with one click.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* User Management Table */
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Campus Directory & Role Elevation</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Total accounts: {userList.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3">Student / Faculty</th>
                  <th className="px-6 py-3">Branch & Roll</th>
                  <th className="px-6 py-3">Reputation</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {userList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`}
                          alt={u.name}
                          className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 object-cover"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-800 dark:text-slate-200">{u.branch || 'CSE'}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">{u.rollNo || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <ReputationBadge points={u.reputation || 0} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        disabled={u.role === 'admin' && u._id === user._id}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {u.isBanned ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          Suspended
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleBanToggle(u._id)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                            u.isBanned
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/50 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700'
                          }`}
                        >
                          {u.isBanned ? 'Reinstate' : 'Suspend'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

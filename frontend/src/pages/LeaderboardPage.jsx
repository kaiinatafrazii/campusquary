import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Flame, Star, Shield, Sparkles } from 'lucide-react';
import API from '../services/api';
import ReputationBadge from '../components/ReputationBadge';

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await API.get('/auth/leaderboard');
        setUsers(data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const topThree = users.slice(0, 3);
  const remaining = users.slice(3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-3">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Campus Hall of Fame</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
          Reputation Leaderboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
          Recognizing the top students and faculty who resolve doubts, share code, and enrich our campus knowledge base.
        </p>
      </div>

      {/* Top 3 Podium */}
      {!loading && topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
          {/* #2 Silver */}
          <div className="order-2 md:order-1 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 text-center shadow-sm relative flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center font-bold text-sm mb-3 shadow-sm">
              2
            </div>
            <img
              src={topThree[1].avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${topThree[1].name}`}
              alt={topThree[1].name}
              className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 object-cover border-2 border-slate-300 dark:border-slate-400 mb-3"
            />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">{topThree[1].name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{topThree[1].role} • {topThree[1].branch}</p>
            <div className="mt-3">
              <ReputationBadge points={topThree[1].reputation || 0} size="md" />
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-1">
              {topThree[1].badges?.slice(0, 2).map((b) => (
                <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* #1 Gold */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50 via-white to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border-2 border-amber-400 dark:border-amber-500/50 rounded-3xl p-8 text-center shadow-lg relative flex flex-col items-center -translate-y-2">
            <div className="absolute -top-3 px-3 py-0.5 bg-amber-500 text-white font-extrabold text-xs rounded-full shadow flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Rank #1</span>
            </div>
            <img
              src={topThree[0].avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${topThree[0].name}`}
              alt={topThree[0].name}
              className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 object-cover border-4 border-amber-400 mb-3 shadow-md"
            />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{topThree[0].name}</h3>
            <p className="text-xs text-amber-700 dark:text-amber-300 capitalize font-medium">{topThree[0].role} • {topThree[0].branch}</p>
            <div className="mt-3">
              <ReputationBadge points={topThree[0].reputation || 0} size="md" />
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {topThree[0].badges?.map((b) => (
                <span key={b} className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* #3 Bronze */}
          <div className="order-3 md:order-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center shadow-sm relative flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-sm mb-3 border border-amber-300 dark:border-amber-700/40">
              3
            </div>
            <img
              src={topThree[2].avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${topThree[2].name}`}
              alt={topThree[2].name}
              className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 object-cover border-2 border-amber-400 dark:border-amber-700/60 mb-3"
            />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">{topThree[2].name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{topThree[2].role} • {topThree[2].branch}</p>
            <div className="mt-3">
              <ReputationBadge points={topThree[2].reputation || 0} size="md" />
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-1">
              {topThree[2].badges?.slice(0, 2).map((b) => (
                <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Full Scholar Standings</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{users.length} Ranked Contributors</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {users.map((u, idx) => (
              <div
                key={u._id}
                className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className={`w-6 font-mono font-bold text-sm ${idx < 3 ? 'text-amber-500' : 'text-slate-400'}`}>
                    #{idx + 1}
                  </span>
                  <img
                    src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`}
                    alt={u.name}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{u.name}</p>
                      {u.role === 'faculty' && (
                        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 px-2 py-0.2 rounded border border-purple-200 dark:border-purple-800/50">
                          Faculty
                        </span>
                      )}
                      {u.role === 'admin' && (
                        <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/80 px-2 py-0.2 rounded border border-indigo-200 dark:border-indigo-800/50">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {u.branch || 'Computer Science'} • {u.semester || '5th Sem'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:flex flex-wrap gap-1 max-w-[200px] justify-end">
                    {u.badges?.slice(0, 2).map((b) => (
                      <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {b}
                      </span>
                    ))}
                  </div>
                  <ReputationBadge points={u.reputation || 0} size="md" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

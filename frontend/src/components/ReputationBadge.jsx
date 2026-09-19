import React from 'react';
import { Award, Zap, Shield, Sparkles } from 'lucide-react';

export default function ReputationBadge({ points = 0, showLabel = true, size = 'md' }) {
  let tier = {
    name: 'Novice',
    color: 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700',
    icon: Sparkles
  };

  if (points >= 300) {
    tier = {
      name: 'Campus Legend',
      color: 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-600/50 shadow-sm',
      icon: Award
    };
  } else if (points >= 150) {
    tier = {
      name: 'Scholar',
      color: 'text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-600/50',
      icon: Shield
    };
  } else if (points >= 50) {
    tier = {
      name: 'Contributor',
      color: 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-600/50',
      icon: Zap
    };
  }

  const Icon = tier.icon;
  const isSmall = size === 'sm';

  return (
    <div
      title={`${points} Reputation Points (${tier.name})`}
      className={`inline-flex items-center font-medium rounded-full border transition-all ${tier.color} ${
        isSmall ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs md:text-sm px-2.5 py-1 gap-1.5'
      }`}
    >
      <Icon className={isSmall ? 'w-3 h-3 text-amber-500 dark:text-amber-400' : 'w-3.5 h-3.5 text-amber-500 dark:text-amber-400'} />
      <span className="font-semibold text-slate-900 dark:text-white">{points}</span>
      {showLabel && <span className="opacity-75 font-normal text-[11px] hidden sm:inline">pts</span>}
    </div>
  );
}

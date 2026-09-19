import React from 'react';
import { Network, Database, Globe, Share2, Cpu, Binary, Brain, Wrench, HelpCircle } from 'lucide-react';

const subjectStyles = {
  'Computer Networks': {
    bg: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700/50',
    icon: Network,
    short: 'CN'
  },
  'DBMS': {
    bg: 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700/50',
    icon: Database,
    short: 'DBMS'
  },
  'Web Programming': {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50',
    icon: Globe,
    short: 'Web Dev'
  },
  'Graph Theory': {
    bg: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700/50',
    icon: Share2,
    short: 'Graph'
  },
  'Operating Systems': {
    bg: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700/50',
    icon: Cpu,
    short: 'OS'
  },
  'Algorithms & DSA': {
    bg: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700/50',
    icon: Binary,
    short: 'DSA'
  },
  'Artificial Intelligence': {
    bg: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50',
    icon: Brain,
    short: 'AI'
  },
  'Software Engineering': {
    bg: 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700/50',
    icon: Wrench,
    short: 'SE'
  },
  'General Doubts': {
    bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    icon: HelpCircle,
    short: 'General'
  }
};

export default function SubjectBadge({ subject, size = 'md', onClick }) {
  const meta = subjectStyles[subject] || subjectStyles['General Doubts'];
  const Icon = meta.icon;

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5 gap-1'
    : 'text-xs md:text-sm px-2.5 py-1 gap-1.5';

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center font-medium rounded-full border transition-all ${meta.bg} ${sizeClasses} ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{subject}</span>
    </span>
  );
}

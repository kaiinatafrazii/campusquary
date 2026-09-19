import React, { useState } from 'react';
import { Bold, Italic, Code, List, Quote, Heading, Eye, Edit3 } from 'lucide-react';
import MarkdownViewer from './MarkdownViewer';

export default function MarkdownEditor({
  value = '',
  onChange,
  placeholder = 'Write your explanation, academic solution or doubt details in Markdown...',
  minRows = 8
}) {
  const [activeTab, setActiveTab] = useState('write'); // 'write' or 'preview'

  const insertFormatting = (prefix, suffix = '') => {
    const textarea = document.getElementById('markdown-editor-input');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText.length || 4)
      );
    }, 0);
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden focus-within:border-indigo-500 shadow-sm transition-colors">
      {/* Toolbar & Tabs */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertFormatting('**', '**')}
            title="Bold (**text**)"
            className="p-1.5 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*')}
            title="Italic (*text*)"
            className="p-1.5 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('### ')}
            title="Heading (### Title)"
            className="p-1.5 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Heading className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
          <button
            type="button"
            onClick={() => insertFormatting('`', '`')}
            title="Inline Code (`code`)"
            className="p-1.5 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('```text\n', '\n```')}
            title="Code Block (```)"
            className="p-1.5 rounded text-xs font-mono font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors px-2"
          >
            {'{ }'}
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('> ')}
            title="Quote (> quote)"
            className="p-1.5 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('- ')}
            title="Bullet List (- item)"
            className="p-1.5 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-lg bg-slate-200/80 dark:bg-slate-800/80 p-0.5 text-xs font-medium border border-slate-300 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              activeTab === 'write'
                ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {activeTab === 'write' ? (
        <textarea
          id="markdown-editor-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={minRows}
          className="w-full bg-white dark:bg-slate-900/60 p-4 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 font-mono text-sm leading-relaxed resize-y focus:outline-none"
        />
      ) : (
        <div className="p-4 bg-slate-50/60 dark:bg-slate-900/40 min-h-[160px] overflow-y-auto">
          {value.trim() ? (
            <MarkdownViewer content={value} />
          ) : (
            <p className="text-slate-400 dark:text-slate-500 italic text-sm">Nothing to preview yet. Switch to Write tab to compose.</p>
          )}
        </div>
      )}

      {/* Footer helper */}
      <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Markdown formatted: Use ```python for code blocks, $x$ for math</span>
        <span>{value.length} characters</span>
      </div>
    </div>
  );
}

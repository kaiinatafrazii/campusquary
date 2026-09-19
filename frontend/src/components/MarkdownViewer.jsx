import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-sm">
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono">
        <span className="font-semibold text-slate-300">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors text-slate-400"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-indigo-100 font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function MarkdownViewer({ content = '' }) {
  if (!content) return null;

  // Split by code blocks first
  const parts = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', text: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'code', language: match[1], code: match[2].trimEnd() });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'text', text: content.slice(lastIndex) });
  }

  const renderTextSegment = (text, keyPrefix) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const key = `${keyPrefix}-${idx}`;

      // Headings
      if (line.startsWith('### ')) {
        return <h4 key={key} className="text-base font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">{renderInline(line.slice(4))}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={key} className="text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2 pb-1 border-b border-slate-200 dark:border-slate-800">{renderInline(line.slice(3))}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={key} className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">{renderInline(line.slice(2))}</h2>;
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        return (
          <blockquote key={key} className="border-l-4 border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/20 pl-4 py-2 my-2 italic text-slate-700 dark:text-slate-300 rounded-r">
            {renderInline(line.slice(2))}
          </blockquote>
        );
      }

      // Bullet lists
      if (/^[-*]\s/.test(line)) {
        return (
          <li key={key} className="ml-5 list-disc text-slate-700 dark:text-slate-300 my-1 leading-relaxed">
            {renderInline(line.replace(/^[-*]\s/, ''))}
          </li>
        );
      }

      // Numbered lists
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={key} className="ml-5 list-decimal text-slate-700 dark:text-slate-300 my-1 leading-relaxed">
            {renderInline(line.replace(/^\d+\.\s/, ''))}
          </li>
        );
      }

      // Empty line
      if (!line.trim()) {
        return <div key={key} className="h-2" />;
      }

      // Standard paragraph
      return (
        <p key={key} className="text-slate-700 dark:text-slate-300 my-1 leading-relaxed">
          {renderInline(line)}
        </p>
      );
    });
  };

  const renderInline = (str) => {
    const tokens = [];
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\$[^$]+\$|\[[^\]]+\]\([^)]+\))/g;
    let match;
    let last = 0;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > last) {
        tokens.push(str.substring(last, match.index));
      }
      const token = match[0];
      if (token.startsWith('`') && token.endsWith('`')) {
        tokens.push(
          <code key={match.index} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 rounded text-xs font-mono font-medium border border-slate-200 dark:border-slate-700">
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('**') && token.endsWith('**')) {
        tokens.push(<strong key={match.index} className="font-semibold text-slate-900 dark:text-white">{token.slice(2, -2)}</strong>);
      } else if (token.startsWith('*') && token.endsWith('*')) {
        tokens.push(<em key={match.index} className="italic text-slate-700 dark:text-slate-200">{token.slice(1, -1)}</em>);
      } else if (token.startsWith('$') && token.endsWith('$')) {
        tokens.push(
          <span key={match.index} className="px-1.5 py-0.5 font-mono text-xs bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded border border-purple-200 dark:border-purple-800/40 font-semibold">
            {token.slice(1, -1)}
          </span>
        );
      } else if (token.startsWith('[') && token.includes('](')) {
        const linkText = token.substring(1, token.indexOf(']'));
        const linkUrl = token.substring(token.indexOf('(') + 1, token.length - 1);
        tokens.push(
          <a key={match.index} href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline underline-offset-2 font-medium">
            {linkText}
          </a>
        );
      }
      last = match.index + token.length;
    }
    if (last < str.length) {
      tokens.push(str.substring(last));
    }

    return tokens.length > 0 ? tokens : str;
  };

  return (
    <div className="markdown-content text-slate-700 dark:text-slate-200 text-sm md:text-base leading-relaxed space-y-1">
      {parts.map((p, idx) => {
        if (p.type === 'code') {
          return <CodeBlock key={`block-${idx}`} code={p.code} language={p.language} />;
        }
        return <div key={`text-${idx}`}>{renderTextSegment(p.text, idx)}</div>;
      })}
    </div>
  );
}

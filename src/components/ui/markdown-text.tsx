import React from 'react';
import { cn } from '@/lib/utils';

interface MarkdownTextProps {
  text: string;
  className?: string;
}

/**
 * Clean, lightweight Markdown parser styled specifically for the official Shadcn design language.
 * Uses standard text-sm typography with readable line heights and clean font-heading/font-mono tokens.
 */
export const MarkdownText: React.FC<MarkdownTextProps> = ({ text, className }) => {
  if (!text) return null;

  const renderInline = (content: string): React.ReactNode[] => {
    const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|_[^_]+_)/g;
    const parts = content.split(inlineRegex);

    return parts.map((part, idx) => {
      if (!part) return null;
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code key={idx} className="font-mono text-xs font-semibold bg-zinc-900 border border-zinc-800 rounded-md px-1.5 py-0.5 text-indigo-300">
            {part.slice(1, -1)}
          </code>
        );
      }
      if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
        return (
          <strong key={idx} className="font-semibold text-zinc-100 font-sans">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
        return (
          <em key={idx} className="italic text-zinc-300 font-sans">
            {part.slice(1, -1)}
          </em>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

  const flushList = () => {
    if (!currentList) return;
    const { type, items } = currentList;
    if (type === 'ul') {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-1.5 my-2.5 text-zinc-300 marker:text-zinc-500 font-sans text-sm">
          {items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ol key={`ol-${elements.length}`} className="list-decimal pl-5 space-y-1.5 my-2.5 text-zinc-300 marker:text-zinc-500 font-sans text-sm">
          {items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
    }
    currentList = null;
  };

  lines.forEach((rawLine, lIdx) => {
    const line = rawLine.trimRight();

    if (/^[\-\*\+]\s+/.test(line.trim())) {
      const itemContent = line.trim().replace(/^[\-\*\+]\s+/, '');
      if (currentList && currentList.type !== 'ul') flushList();
      if (!currentList) currentList = { type: 'ul', items: [] };
      currentList.items.push(itemContent);
      return;
    }

    if (/^\d+\.\s+/.test(line.trim())) {
      const itemContent = line.trim().replace(/^\d+\.\s+/, '');
      if (currentList && currentList.type !== 'ol') flushList();
      if (!currentList) currentList = { type: 'ol', items: [] };
      currentList.items.push(itemContent);
      return;
    }

    flushList();

    if (line.trim() === '') {
      elements.push(<div key={`empty-${lIdx}`} className="h-2.5" />);
      return;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h5 key={lIdx} className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mt-3.5 mb-1.5 font-mono">
          {renderInline(line.slice(4))}
        </h5>
      );
      return;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h4 key={lIdx} className="text-base font-semibold text-zinc-100 mt-3.5 mb-1.5 font-heading tracking-tight">
          {renderInline(line.slice(3))}
        </h4>
      );
      return;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h3 key={lIdx} className="text-lg font-bold text-zinc-100 mt-4 mb-2 border-b border-zinc-800/80 pb-1.5 font-heading tracking-tight">
          {renderInline(line.slice(2))}
        </h3>
      );
      return;
    }

    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={lIdx} className="border-l-[3px] border-zinc-700 pl-3.5 my-2.5 text-zinc-400 italic text-sm">
          {renderInline(line.slice(2))}
        </blockquote>
      );
      return;
    }

    elements.push(
      <p key={lIdx} className="leading-relaxed text-sm text-zinc-300">
        {renderInline(line)}
      </p>
    );
  });

  flushList();

  return <div className={cn('space-y-1 text-sm font-sans', className)}>{elements}</div>;
};

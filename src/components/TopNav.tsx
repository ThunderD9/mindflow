import React from 'react';
import { 
  ClockIcon, 
  CheckSquareIcon, 
  BookOpenIcon, 
  Sparkle, 
  SettingsIcon, 
} from 'lucide-react';
import { ActiveTab } from '../types';
import { cn } from '@/lib/utils';

interface TopNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  taskCount: number;
  diaryCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  taskCount,
  diaryCount,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'timeline',
      label: 'Daily Timeline',
      icon: <ClockIcon className="size-4 text-indigo-400" aria-hidden="true" />,
    },
    {
      id: 'tasks',
      label: 'Tasks & Action',
      icon: <CheckSquareIcon className="size-4 text-emerald-400" aria-hidden="true" />,
      badge: taskCount,
    },
    {
      id: 'diary',
      label: 'Notes & Diary',
      icon: <BookOpenIcon className="size-4 text-amber-400" aria-hidden="true" />,
      badge: diaryCount,
    },
  ];

  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center pointer-events-none select-none font-sans px-4">
      {/* ONLY the 3 Navigation Tabs floating in the glass pill */}
      <nav 
        className="glass-nav p-1.5 rounded-full flex items-center gap-1.5 shadow-2xl pointer-events-auto h-12"
        style={{
          WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
          backdropFilter: 'blur(24px) saturate(1.8)',
          background: '#08080a94',
          border: '1px solid #ffffff1a',
          borderRadius: '9999px',
        }}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={cn(
                'h-9 px-4 sm:px-5 rounded-full text-sm font-medium transition-all inline-flex items-center gap-2 select-none cursor-pointer',
                isActive 
                  ? 'text-white bg-white/[0.12] border border-white/[0.15] shadow-xs font-semibold' 
                  : 'text-[#8e8e93] hover:text-[#e4e4e7] hover:bg-white/[0.05]'
              )}
            >
              {item.icon}
              <span className="tracking-tight">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={cn(
                  'text-xs font-mono tabular-nums px-2 py-0.5 rounded-full font-bold transition-colors ml-0.5',
                  isActive ? 'bg-zinc-900 text-zinc-100 border border-white/10' : 'bg-zinc-800/80 text-zinc-400'
                )}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};

interface TopHeaderProps {
  onOpenSettings: () => void;
  onOpenAiCopilot: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenSettings,
  onOpenAiCopilot,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-12 sm:pb-16 grid grid-cols-[1fr_auto_1fr] items-center min-h-[64px] select-none font-sans shrink-0">
      {/* Left: Original Brand Identity with Flat Compact OS Badge */}
      <div className="flex items-center justify-start gap-2">
        <span className="font-extrabold tracking-tight text-zinc-100 text-base flex items-center gap-2 font-heading">
          <span>MindFlow</span>
          <span className="h-5 px-1.5 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800 text-[11px] font-mono uppercase font-bold tracking-wider inline-flex items-center justify-center leading-none">
            OS
          </span>
        </span>
      </div>

      {/* Center Spacer: Mathematically matches the floating center pill to ensure exact symmetrical 1fr balance on left and right */}
      <div className="w-[430px] sm:w-[480px] h-12 pointer-events-none" />

      {/* Right: AI Copilot & Settings (Scrolls away naturally as you scroll down) */}
      <div className="flex items-center justify-end gap-2.5">
        {/* AI Copilot Button */}
        <button
          type="button"
          onClick={onOpenAiCopilot}
          className="h-9 px-3.5 bg-zinc-100 hover:bg-white active:scale-[0.98] text-zinc-950 font-semibold text-xs sm:text-sm rounded-full inline-flex items-center gap-1.5 shadow-sm transition-all duration-150 cursor-pointer"
          title="Open AI Copilot (Ctrl+K)"
        >
          <Sparkle className="size-3.5 text-zinc-950 shrink-0" aria-hidden="true" />
          <span className="font-sans">AI</span>
        </button>

        {/* Settings Toggle */}
        <button
          type="button"
          onClick={onOpenSettings}
          title="Open Settings & API Keys"
          className="size-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors cursor-pointer"
        >
          <SettingsIcon className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

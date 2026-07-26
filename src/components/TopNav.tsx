import React from 'react';
import { 
  ClockIcon, 
  CheckSquareIcon, 
  BookOpenIcon, 
  CalendarIcon, 
  SparklesIcon, 
  SettingsIcon, 
  ZapIcon
} from 'lucide-react';
import { ActiveTab } from '../types';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface TopNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  onOpenAiCopilot: () => void;
  taskCount: number;
  diaryCount: number;
  currentModel: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  onOpenSettings,
  onOpenAiCopilot,
  taskCount,
  diaryCount,
  currentModel,
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
    {
      id: 'weekly',
      label: 'Weekly Planner',
      icon: <CalendarIcon className="size-4 text-sky-400" aria-hidden="true" />,
    },
  ];

  const formatModelName = (modelStr: string) => {
    if (modelStr.includes('3.6-flash')) return 'Gemini 3.6 Flash';
    if (modelStr.includes('3.6-pro') || modelStr.includes('3.6-ultra')) return 'Gemini 3.6 Pro';
    if (modelStr.includes('3.0-flash')) return 'Gemini 3.0 Flash';
    return 'Gemini AI';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md transition-all font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Brand Identity */}
        <div className="flex items-center shrink-0">
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-zinc-100 text-base flex items-center gap-2 font-heading">
              <span>MindFlow</span>
              <span className="text-xs font-mono uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800">
                OS
              </span>
            </span>
          </div>
        </div>

        {/* Center Navigation Tab Switcher ("Minimal But Cool" Affordance) */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-900/70 p-1.5 rounded-2xl border border-zinc-800/80 shadow-xs">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'h-8 px-3 rounded-lg text-xs font-medium transition-all inline-flex items-center gap-2 relative select-none font-sans',
                  isActive 
                    ? 'bg-zinc-100 text-zinc-950 font-bold shadow-xs' 
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={cn(
                    'text-xs font-mono tabular-nums px-2 py-0.5 rounded-full font-semibold transition-colors',
                    isActive ? 'bg-zinc-900 text-zinc-200' : 'bg-zinc-800 text-zinc-400'
                  )}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Utilities & Founder Copilot Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          {/* AI Copilot Chat Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOpenAiCopilot}
            className="h-8 px-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 text-xs font-medium rounded-lg gap-2 transition-all duration-200 font-sans border border-transparent hover:border-zinc-800"
          >
            <SparklesIcon className="size-3.5 text-indigo-400" aria-hidden="true" />
            <span>AI Copilot</span>
            <span className="hidden sm:inline-block text-[10px] font-mono uppercase bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-500 font-medium tracking-tight border border-zinc-800">
              Ctrl+K
            </span>
          </Button>

          {/* Settings / Local Storage Modal Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            title="Open Local Settings & API Keys"
            aria-label="Settings and computer storage setup"
            className="size-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg border border-transparent hover:border-zinc-800 transition-all duration-200"
          >
            <SettingsIcon className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="md:hidden flex items-center justify-around gap-1.5 px-3 py-2.5 border-t border-zinc-800/80 bg-zinc-950/95 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={cn(
                'h-9 px-3.5 rounded-xl text-sm font-medium transition-all inline-flex items-center gap-2 shrink-0 font-sans',
                isActive ? 'bg-zinc-100 text-zinc-950 font-bold shadow-xs' : 'text-zinc-400 hover:bg-zinc-900'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

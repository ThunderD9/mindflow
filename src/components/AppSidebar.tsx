import React from 'react';
import { 
  CheckSquareIcon, 
  BookOpenIcon, 
  CalendarIcon, 
  SparklesIcon, 
  SettingsIcon, 
  FeatherIcon
} from 'lucide-react';
import { ActiveTab, AppSettings, Task, DiaryEntry } from '../types';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  onOpenSettings: () => void;
  settings: AppSettings;
  tasks: Task[];
  diaryEntries: DiaryEntry[];
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  setActiveTab,
  isAiDrawerOpen,
  setIsAiDrawerOpen,
  onOpenSettings,
  settings,
  tasks,
  diaryEntries,
}) => {
  const openTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const notesCount = diaryEntries.length;
  const isKeyReady = Boolean(settings.geminiApiKey && settings.geminiApiKey.trim() !== '');

  const navItems = [
    { id: 'tasks' as ActiveTab, label: 'Tasks', icon: CheckSquareIcon, count: openTasksCount },
    { id: 'diary' as ActiveTab, label: 'Notes & Diary', icon: BookOpenIcon, count: notesCount },
    { id: 'weekly' as ActiveTab, label: 'Weekly Plan', icon: CalendarIcon, count: null },
  ];

  return (
    <aside 
      aria-label="Workspace Sidebar"
      className="w-56 h-screen shrink-0 border-r border-zinc-800/80 bg-zinc-950 flex flex-col justify-between select-none overflow-y-auto z-20 font-sans"
    >
      {/* Minimalist Top & Nav */}
      <div className="flex flex-col gap-6 p-4">
        {/* Simple Brand Header */}
        <div className="flex items-center gap-2.5 px-1 pt-1">
          <div className="size-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
            <FeatherIcon className="size-3.5 text-zinc-200" aria-hidden="true" />
          </div>
          <span className="text-xs font-semibold tracking-tight text-zinc-100 font-sans">
            MindFlow
          </span>
        </div>

        {/* Minimal Navigation */}
        <nav className="flex flex-col gap-1" aria-label="Views">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full h-9 flex items-center justify-between px-3 rounded-md text-xs font-medium transition-colors font-sans',
                  isActive 
                    ? 'bg-zinc-900 text-zinc-100 font-semibold' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={cn('size-4 shrink-0', isActive ? 'text-zinc-100' : 'text-zinc-500')} aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== null && item.count > 0 && (
                  <span className={cn(
                    'text-[11px] font-mono tabular-nums px-1.5 py-0.2 rounded',
                    isActive ? 'text-zinc-200 bg-zinc-800' : 'text-zinc-500 bg-zinc-900/60'
                  )}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Minimalist Bottom Actions */}
      <div className="flex flex-col gap-1 p-3 border-t border-zinc-900 bg-zinc-950">
        <button
          type="button"
          onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
          className={cn(
            'w-full h-9 flex items-center justify-between px-3 rounded-md text-xs font-medium transition-colors font-sans',
            isAiDrawerOpen 
              ? 'bg-zinc-800 text-zinc-100 font-semibold' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <SparklesIcon className="size-3.5 text-zinc-400 shrink-0" aria-hidden="true" />
            <span>AI Assistant</span>
          </div>
          <span className={cn('size-1.5 rounded-full', isKeyReady ? 'bg-zinc-500' : 'bg-amber-500/80')} />
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full h-9 flex items-center gap-2 px-3 rounded-md text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 font-normal transition-colors font-sans"
        >
          <SettingsIcon className="size-3.5 text-zinc-500 shrink-0" aria-hidden="true" />
          <span>Settings & API Key</span>
        </button>
      </div>
    </aside>
  );
};

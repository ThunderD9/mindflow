import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { cn, getEffectiveDate } from './lib/utils';
import { Task, DiaryEntry, AppSettings, ActiveTab, AiChatMessage, WeekDay } from './types';
import { LocalStorageService } from './services/storage';
import { GeminiService } from './services/geminiService';
import { TopNav, TopHeader } from './components/TopNav';
import { DailyTimelineView } from './components/DailyTimelineView';
import { TaskBoard } from './components/TaskBoard';
import { JournalWorkspace } from './components/JournalWorkspace';
import { AiCopilotDrawer } from './components/AiCopilotDrawer';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => LocalStorageService.getTasks());
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => LocalStorageService.getDiaryEntries());
  const [settings, setSettings] = useState<AppSettings>(() => LocalStorageService.getSettings());
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('timeline');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [initialAiPrompt, setInitialAiPrompt] = useState<string>('');
  const [viewDate, setViewDate] = useState<Date>(new Date());
  
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayShort = format(new Date(), 'EEE') as WeekDay;
  const todaysTaskCount = tasks.filter((t) => {
    const effectiveDate = getEffectiveDate(t);
    return effectiveDate === todayStr && (t.status === 'todo' || t.status === 'in_progress');
  }).length;
  
  const [chatMessages, setChatMessages] = useState<AiChatMessage[]>(() => {
    const saved = LocalStorageService.getAiChatHistory();
    if (saved && saved.length > 0) return saved;
    return [
      {
        id: 'welcome-founder-1',
        sender: 'assistant',
        text: "Welcome to MindFlow OS! I am your autonomous Founder AI Copilot. Map out your daily timeline, schedule tasks, or attach files and reference links to anything. What are we building today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ];
  });

  const [aiService, setAiService] = useState<GeminiService | null>(null);

  // Keyboard shortcuts: Ctrl+K for Copilot, Ctrl+, for Settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsCopilotOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync state changes directly to desktop storage
  useEffect(() => {
    LocalStorageService.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    LocalStorageService.saveDiaryEntries(diaryEntries);
  }, [diaryEntries]);

  // Sanitize and remove corrupted duplicates with the exact same ID on load
  useEffect(() => {
    if (localStorage.getItem('MIGRATE_WIPE_V8') !== 'done') {
      localStorage.removeItem('mindflow_diary');
      localStorage.removeItem('mindflow_diary_v2');
      localStorage.setItem('MIGRATE_WIPE_V8', 'done');
      setDiaryEntries([]);
      window.location.reload();
      return;
    }

    setDiaryEntries((prev) => {
      const seen = new Set();
      const deduplicated = prev.filter(entry => {
        if (seen.has(entry.id)) return false;
        seen.add(entry.id);
        return true;
      });
      if (deduplicated.length !== prev.length) return deduplicated;
      return prev;
    });
  }, []);

  useEffect(() => {
    LocalStorageService.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    LocalStorageService.saveAiChatHistory(chatMessages);
  }, [chatMessages]);

  // Initialize Gemini AI Copilot
  useEffect(() => {
    if (!settings.geminiApiKey) {
      setAiService(null);
      return;
    }

    const handlers = {
      addTask: (taskData: Partial<Task>) => {
        const newTask: Task = {
          id: 'task-ai-' + Date.now(),
          title: taskData.title || 'New Objective',
          description: taskData.description || '',
          category: (taskData.category as any) || 'Work',
          priority: taskData.priority || 'medium',
          status: 'todo',
          scheduledDay: taskData.scheduledDay || 'Mon',
          time: taskData.time || '09:00 AM',
          durationHours: 1,
          attachments: [],
          createdAt: new Date().toISOString(),
          ...taskData,
        };
        setTasks((prev) => [newTask, ...prev]);
        return newTask;
      },
      updateTask: (query: string, newStatus: 'todo' | 'in_progress' | 'completed') => {
        let found = false;
        setTasks((prev) =>
          prev.map((t) => {
            if (t.title.toLowerCase().includes(query.toLowerCase()) || t.id === query) {
              found = true;
              return { ...t, status: newStatus };
            }
            return t;
          })
        );
        return found;
      },
      deleteTask: (query: string) => {
        let found = false;
        setTasks((prev) =>
          prev.filter((t) => {
            const matches = t.title.toLowerCase().includes(query.toLowerCase()) || t.id === query;
            if (matches) found = true;
            return !matches;
          })
        );
        return found;
      },
      addDiary: (entryData: Partial<DiaryEntry>) => {
        const newEntry: DiaryEntry = {
          id: 'diary-ai-' + Date.now(),
          date: entryData.date || new Date().toISOString().split('T')[0],
          title: entryData.title || 'Founder Reflection',
          content: entryData.content || '',
          mood: entryData.mood || 'calm',
          tags: entryData.tags || ['AI Generated'],
          attachments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...entryData,
        };
        setDiaryEntries((prev) => {
          const filtered = prev.filter((e) => e.date !== newEntry.date);
          return [newEntry, ...filtered];
        });
        return newEntry;
      },
    };

    const service = new GeminiService(settings.geminiApiKey, settings.model || 'gemini-3.6-flash', handlers);
    setAiService(service);
  }, [settings.geminiApiKey, settings.model]);

  // Task Handlers
  const handleAddTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: 'task-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const handleUpdateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const handleDeleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Diary Handlers
  const handleAddDiaryEntry = useCallback((entryData: Partial<DiaryEntry>) => {
    const dateStr = entryData.date || format(new Date(), 'yyyy-MM-dd');
    const created: DiaryEntry = {
      id: entryData.id || ('diary-' + crypto.randomUUID()),
      date: dateStr,
      title: entryData.title || `Reflection for ${dateStr}`,
      content: entryData.content || '',
      mood: entryData.mood || 'focused',
      tags: entryData.tags || ['Reflection'],
      attachments: entryData.attachments || [],
      createdAt: entryData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: entryData.isPinned || false,
    };
    setDiaryEntries((prev) => [created, ...prev]);
    return created;
  }, []);

  const handleUpdateDiaryEntry = useCallback((id: string, updates: Partial<DiaryEntry>) => {
    setDiaryEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...updates, updatedAt: new Date().toISOString() } : entry))
    );
  }, []);

  const handleDeleteDiaryEntry = useCallback((id: string) => {
    setDiaryEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const handleOpenAiWithPrompt = useCallback((prompt: string) => {
    setInitialAiPrompt(prompt);
    setIsCopilotOpen(true);
  }, []);

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 font-sans antialiased flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden relative">
      {/* Floating 3-Tabs Glass Nav (Sticks and stays floating when scrolling) */}
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        taskCount={todaysTaskCount}
        diaryCount={diaryEntries.length}
      />

      {/* Main Content Workspace (Scrolls naturally) */}
      <main className={cn("flex-1 w-full font-sans", activeTab !== 'diary' ? "max-w-7xl mx-auto px-4 sm:px-6 pb-12 overflow-y-auto" : "flex flex-col overflow-hidden")}>
        {/* Static Header Row: Logo & AI/Settings sit at the top and scroll away as you scroll */}
        <TopHeader
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAiCopilot={() => {
            setInitialAiPrompt('');
            setIsCopilotOpen(true);
          }}
        />

        {activeTab === 'timeline' && (
          <DailyTimelineView
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onOpenAiWithPrompt={handleOpenAiWithPrompt}
            viewDate={viewDate}
            setViewDate={setViewDate}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskBoard
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onOpenAiWithPrompt={handleOpenAiWithPrompt}
            viewDate={viewDate}
            setViewDate={setViewDate}
          />
        )}

        {activeTab === 'diary' && (
          <JournalWorkspace
            entries={diaryEntries}
            onAddEntry={handleAddDiaryEntry}
            onUpdateEntry={handleUpdateDiaryEntry}
            onDeleteEntry={handleDeleteDiaryEntry}
            onOpenAiWithPrompt={handleOpenAiWithPrompt}
          />
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <h2 className="text-xl font-bold mb-4">Local Computer Settings</h2>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="px-4 py-2 rounded-lg bg-indigo-600 font-semibold text-white hover:bg-indigo-700 transition-all shadow-sm"
            >
              Open Settings & API Modal
            </button>
          </div>
        )}
      </main>

      {/* Autonomous Founder AI Copilot Drawer */}
      <AiCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        settings={settings}
        onOpenSettings={() => {
          setIsCopilotOpen(false);
          setIsSettingsOpen(true);
        }}
        tasks={tasks}
        diaryEntries={diaryEntries}
        chatHistory={chatMessages}
        setChatHistory={setChatMessages}
        appStateHandlers={{
          addTask: (taskData) => {
            const created = {
              title: taskData.title || 'New Objective',
              description: taskData.description || '',
              category: (taskData.category as any) || 'Work',
              priority: taskData.priority || 'medium',
              status: 'todo' as const,
              scheduledDay: taskData.scheduledDay || 'Mon',
              time: taskData.time || '09:00 AM',
              durationHours: 1,
              attachments: [],
              ...taskData,
            };
            handleAddTask(created);
            return created as any;
          },
          updateTask: (query, status) => {
            let found = false;
            setTasks((prev) =>
              prev.map((t) => {
                if (t.title.toLowerCase().includes(query.toLowerCase()) || t.id === query) {
                  found = true;
                  return { ...t, status };
                }
                return t;
              })
            );
            return found;
          },
          deleteTask: (query) => {
            let found = false;
            setTasks((prev) =>
              prev.filter((t) => {
                const matches = t.title.toLowerCase().includes(query.toLowerCase()) || t.id === query;
                if (matches) found = true;
                return !matches;
              })
            );
            return found;
          },
          addDiary: (entryData) => {
            return handleAddDiaryEntry(entryData);
          },
        }}
        initialPrompt={initialAiPrompt}
        onClearInitialPrompt={() => setInitialAiPrompt('')}
      />

      {/* Local Storage & Gemini Model Configuration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
      />
    </div>
  );
};

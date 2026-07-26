import { Task, DiaryEntry, WeeklyGoal, AppSettings, AiChatMessage } from '../types';

const STORAGE_KEYS = {
  TASKS: 'mindflow_tasks',
  DIARY: 'mindflow_diary_v2',
  WEEKLY_GOALS: 'mindflow_weekly_goals',
  SETTINGS: 'mindflow_settings',
  AI_CHAT: 'mindflow_ai_chat',
  CLEAN_FLAG: 'mindflow_minimalist_clean_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  model: 'gemini-3.6-flash',
  theme: 'dark',
  enableAiAutoEdit: true,
};

// Single clean minimalist initial task
const INITIAL_TASKS: Task[] = [
  {
    id: 'task-clean-1',
    title: 'Focus on one important objective today',
    description: 'Keep things peaceful, steady, and intentional.',
    category: 'Work',
    priority: 'medium',
    status: 'todo',
    scheduledDay: 'Mon',
    createdAt: new Date().toISOString(),
  },
];

// Single clean minimalist initial reflection note
const INITIAL_DIARY: DiaryEntry[] = [
  {
    id: 'diary-clean-1',
    date: new Date().toISOString().split('T')[0],
    title: 'A quiet space to think and reflect',
    content: 'Writing clears the mind. Capture simple reflections, daily progress, or notes here without distractions.',
    mood: 'calm',
    tags: ['Reflection'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Single clean initial weekly objective
const INITIAL_GOALS: WeeklyGoal[] = [
  { id: 'goal-clean-1', weekId: 'current', title: 'Maintain steady focus throughout the week', completed: false },
];

// Ensure clean migration away from cluttered sample data
const ensureMinimalistReset = () => {
  try {
    const isCleaned = localStorage.getItem(STORAGE_KEYS.CLEAN_FLAG);
    if (!isCleaned) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
      localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(INITIAL_DIARY));
      localStorage.setItem(STORAGE_KEYS.WEEKLY_GOALS, JSON.stringify(INITIAL_GOALS));
      localStorage.setItem(STORAGE_KEYS.CLEAN_FLAG, 'true');
    }
  } catch (e) {
    // ignore localstorage errors
  }
};

export const LocalStorageService = {
  getTasks: (): Task[] => {
    try {
      ensureMinimalistReset();
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
        return INITIAL_TASKS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_TASKS;
    }
  },

  saveTasks: (tasks: Task[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks:', e);
    }
  },

  getDiaryEntries: (): DiaryEntry[] => {
    try {
      ensureMinimalistReset();
      const data = localStorage.getItem(STORAGE_KEYS.DIARY);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(INITIAL_DIARY));
        return INITIAL_DIARY;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_DIARY;
    }
  },

  saveDiaryEntries: (entries: DiaryEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(entries));
    } catch (e) {
      console.error('Failed to save diary entries:', e);
    }
  },

  getWeeklyGoals: (): WeeklyGoal[] => {
    try {
      ensureMinimalistReset();
      const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_GOALS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.WEEKLY_GOALS, JSON.stringify(INITIAL_GOALS));
        return INITIAL_GOALS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_GOALS;
    }
  },

  saveWeeklyGoals: (goals: WeeklyGoal[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.WEEKLY_GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error('Failed to save weekly goals:', e);
    }
  },

  getSettings: (): AppSettings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings: AppSettings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  getAiChatHistory: (): AiChatMessage[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AI_CHAT);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveAiChatHistory: (messages: AiChatMessage[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.AI_CHAT, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat history:', e);
    }
  },

  exportData: (): string => {
    const backup = {
      tasks: LocalStorageService.getTasks(),
      diary: LocalStorageService.getDiaryEntries(),
      weeklyGoals: LocalStorageService.getWeeklyGoals(),
      settings: LocalStorageService.getSettings(),
      chatHistory: LocalStorageService.getAiChatHistory(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importData: (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.tasks) localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(parsed.tasks));
      if (parsed.diary) localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(parsed.diary));
      if (parsed.weeklyGoals) localStorage.setItem(STORAGE_KEYS.WEEKLY_GOALS, JSON.stringify(parsed.weeklyGoals));
      if (parsed.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
      if (parsed.chatHistory) localStorage.setItem(STORAGE_KEYS.AI_CHAT, JSON.stringify(parsed.chatHistory));
      return true;
    } catch {
      return false;
    }
  },

  clearAllData: () => {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.DIARY);
    localStorage.removeItem(STORAGE_KEYS.WEEKLY_GOALS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.AI_CHAT);
  },
};

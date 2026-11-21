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

// Clean, professional sample tasks
const INITIAL_TASKS: Task[] = [];
const INITIAL_DIARY: DiaryEntry[] = [];
const INITIAL_GOALS: WeeklyGoal[] = [];

// Pure safe getter that never overwrites existing user data
export const LocalStorageService = {
  getTasks: (): Task[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
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
      const data = localStorage.getItem(STORAGE_KEYS.DIARY);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
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
      const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_GOALS);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
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

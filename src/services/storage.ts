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
const INITIAL_TASKS: Task[] = [
  {
    id: 'task-sample-1',
    title: 'Review Q4 product roadmap & sync with engineering team',
    description: 'Align with design on badge contrast tokens and ensure offline sync specs are finalized.',
    category: 'Work',
    priority: 'high',
    status: 'todo',
    scheduledDay: 'Mon',
    time: '08:00 AM',
    durationHours: 1,
    attachments: [{ id: 'att-1', type: 'file', url: '#', name: 'Roadmap_Spec_v2.pdf', size: 2400000, createdAt: new Date().toISOString() }],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-sample-2',
    title: 'Deep work: Implement zero-knowledge encryption pipeline for local backups',
    description: 'AES-GCM encryption with Argon2 key derivation. Zero plaintext leaks to disk.',
    category: 'Work',
    priority: 'urgent',
    status: 'todo',
    scheduledDay: 'Mon',
    time: '09:00 AM',
    durationHours: 1,
    attachments: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-sample-3',
    title: 'Founder pitch deck review with lead angel investors and technical advisors for Seed Round extension',
    description: 'Prepare 10-slide deck focusing on user retention, offline architecture, and developer adoption metrics.',
    category: 'Ideas',
    priority: 'high',
    status: 'todo',
    scheduledDay: 'Mon',
    time: '10:00 AM',
    durationHours: 1,
    attachments: [{ id: 'att-2', type: 'file', url: '#', name: 'Seed_Deck_Nov2026.pdf', size: 8100000, createdAt: new Date().toISOString() }],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-sample-4',
    title: 'Architecture review: Optimize SQLite query planner and reduce cold start time',
    description: 'Ensure vacuuming and index lookups stay under 12ms even on 100k+ records.',
    category: 'Work',
    priority: 'medium',
    status: 'half_completed',
    scheduledDay: 'Mon',
    time: '11:00 AM',
    durationHours: 1,
    attachments: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-sample-5',
    title: "Read Chapter 4 of 'Designing Data-Intensive Applications' on stream processing",
    description: 'Focus on idempotent message processing and partition rebalancing.',
    category: 'Learning',
    priority: 'low',
    status: 'todo',
    scheduledDay: 'Mon',
    time: '02:00 PM',
    durationHours: 1,
    attachments: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-sample-6',
    title: 'Review and merge pull requests for release candidate v1.2.0',
    description: 'All automated CI tests passed on Ubuntu, macOS, and Windows runners.',
    category: 'Work',
    priority: 'high',
    status: 'completed',
    scheduledDay: 'Mon',
    time: '04:00 PM',
    durationHours: 1,
    attachments: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-sample-7',
    title: '5km evening run & mobility recovery routine',
    description: 'Pace: 5:15/km. Great energy today.',
    category: 'Health',
    priority: 'medium',
    status: 'completed',
    scheduledDay: 'Mon',
    time: '05:30 PM',
    durationHours: 1,
    attachments: [],
    createdAt: new Date().toISOString(),
  },
];

// Clean, professional sample reflection note
const INITIAL_DIARY: DiaryEntry[] = [
  {
    id: 'diary-sample-1',
    date: new Date().toISOString().split('T')[0],
    title: 'Building with Pure Intentionality',
    content: '<h3>Focus on the Essentials</h3><p>Today was about stripping away noise. When building software, the temptation is always to add more knobs, more toggles, more surface area. But true power comes from clarity.</p><p>Key reflections for today:</p><ul><li><strong>Offline-first gives peace of mind:</strong> Users never have to worry about spinners, downtime, or network latency. Everything responds in 0ms.</li><li><strong>Visual rhythm matters:</strong> A well-aligned timeline brings calm to a chaotic workday.</li><li><strong>Ruthless prioritization:</strong> Accomplish 2 high-leverage objectives before noon, and the rest of the day is a victory.</li></ul><p>Steady progress beats frantic effort every single time.</p>',
    mood: 'focused',
    tags: ['Product', 'Focus', 'Mindset'],
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPinned: true,
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

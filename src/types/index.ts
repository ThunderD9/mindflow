export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskCategory = 'Work' | 'Personal' | 'Health' | 'Learning' | 'Ideas' | 'General';
export type WeekDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'file' | 'link';
  name: string;
  url: string; // Base64 data URL for local files/images/videos, or https web URL for links
  size?: number;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string; // YYYY-MM-DD
  scheduledDay?: WeekDay | null; // Monday - Sunday for weekly planner
  time?: string; // e.g., "09:00 AM" or "14:30"
  durationHours?: number; // For hourly time-blocking timeline
  attachments?: Attachment[]; // Universal file, image, video, or link attachments
  linkedNoteIds?: string[]; // Bi-directional linking to diary entries
  aiAnalysis?: string; // Saved AI Copilot analysis
  createdAt: string;
}

export type MoodType = 'calm' | 'productive' | 'excited' | 'thoughtful' | 'energetic' | 'neutral' | 'stressed' | 'focused' | 'inspired' | 'fatigued' | 'accomplished';
export type Mood = MoodType;

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
  mood: MoodType;
  tags?: string[];
  attachments?: Attachment[]; // Universal media and link attachments
  linkedTaskIds?: string[]; // Bi-directional linking to tasks
  isPinned?: boolean; // Pinned entries show globally in the sidebar
  createdAt: string;
  updatedAt?: string;
}

export interface WeeklyGoal {
  id: string;
  weekId?: string; // e.g. "2026-W30"
  title: string;
  completed?: boolean;
  time?: string;
  targetDate?: string;
  status?: 'todo' | 'in_progress' | 'completed';
  progress?: number;
  milestones?: string[];
  attachments?: Attachment[];
}
export type Goal = WeeklyGoal;

export interface AppSettings {
  geminiApiKey: string;
  model: string;
  theme: 'dark' | 'midnight' | 'cyberpunk';
  enableAiAutoEdit: boolean;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  toolCallsExecuted?: Array<{
    name: string;
    description: string;
    details?: string;
  }>;
}

export type ActiveTab = 'timeline' | 'tasks' | 'diary' | 'weekly' | 'settings';

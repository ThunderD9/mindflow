import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { Task, DiaryEntry, WeeklyGoal, WeekDay, Priority, TaskCategory, MoodType, AiChatMessage } from '../types';

export interface AiToolExecutionResult {
  toolName: string;
  description: string;
  details?: string;
  data?: any;
}

export interface AppStateHandlers {
  addTask: (task: Partial<Task>) => Task;
  updateTask: (taskQuery: string, status: 'todo' | 'in_progress' | 'completed') => boolean;
  deleteTask?: (taskQuery: string) => boolean;
  addDiary: (entry: Partial<DiaryEntry>) => DiaryEntry;
  deleteDiary?: (diaryQuery: string) => boolean;
  addGoals: (goals: string[]) => void;
  toggleGoal?: (goalQuery: string) => boolean;
}

// Function Declarations for Gemini Tool Calling
const createTaskDeclaration: FunctionDeclaration = {
  name: 'create_task',
  description: 'Create a new task in the app with category, priority, and optional scheduled day of the week.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Title of the task' },
      description: { type: Type.STRING, description: 'Detailed description or notes for the task' },
      category: {
        type: Type.STRING,
        enum: ['Work', 'Personal', 'Health', 'Learning', 'Ideas', 'General'],
        description: 'Category of the task',
      },
      priority: {
        type: Type.STRING,
        enum: ['urgent', 'high', 'medium', 'low'],
        description: 'Priority level of the task',
      },
      scheduledDay: {
        type: Type.STRING,
        enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        description: 'Day of the week to schedule this task on the weekly planner',
      },
    },
    required: ['title'],
  },
};

const updateTaskStatusDeclaration: FunctionDeclaration = {
  name: 'update_task_status',
  description: 'Update the completion status of an existing task by matching its title or ID.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      taskQuery: { type: Type.STRING, description: 'Title or partial matching keyword or ID of the task to update' },
      status: {
        type: Type.STRING,
        enum: ['todo', 'in_progress', 'completed'],
        description: 'New status for the task',
      },
    },
    required: ['taskQuery', 'status'],
  },
};

const deleteTaskDeclaration: FunctionDeclaration = {
  name: 'delete_task',
  description: 'Delete a task from the task list by matching its title or ID.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      taskQuery: { type: Type.STRING, description: 'Title, keyword, or ID of the task to delete' },
    },
    required: ['taskQuery'],
  },
};

const createDiaryEntryDeclaration: FunctionDeclaration = {
  name: 'create_diary_entry',
  description: 'Create a new daily diary entry or journal note in the app.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Title of the diary entry' },
      content: { type: Type.STRING, description: 'Markdown formatted content or reflection text' },
      mood: {
        type: Type.STRING,
        enum: ['calm', 'productive', 'excited', 'thoughtful', 'energetic', 'neutral', 'stressed'],
        description: 'Mood associated with the entry',
      },
      tags: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'List of tags associated with the entry',
      },
    },
    required: ['title', 'content'],
  },
};

const deleteDiaryEntryDeclaration: FunctionDeclaration = {
  name: 'delete_diary_entry',
  description: 'Delete a diary entry by matching its title, date, or ID.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      diaryQuery: { type: Type.STRING, description: 'Title, keyword, date, or ID of the diary entry to remove' },
    },
    required: ['diaryQuery'],
  },
};

const planWeeklyGoalsDeclaration: FunctionDeclaration = {
  name: 'plan_weekly_goals',
  description: 'Add core high-level weekly goals to the weekly planner.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      goals: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Array of high level goal descriptions for the week',
      },
    },
    required: ['goals'],
  },
};

const toggleWeeklyGoalDeclaration: FunctionDeclaration = {
  name: 'toggle_weekly_goal',
  description: 'Toggle completion status of a weekly objective/goal matching the query.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      goalQuery: { type: Type.STRING, description: 'Title or keyword of the weekly goal to toggle' },
    },
    required: ['goalQuery'],
  },
};

export class GeminiService {
  private apiKey: string;
  private modelName: string;

  constructor(apiKey: string, modelName: string = 'gemini-2.5-flash', handlers?: AppStateHandlers) {
    this.apiKey = apiKey;
    this.modelName = modelName || 'gemini-2.5-flash';
  }

  public async chatWithCopilot(
    userMessage: string,
    currentTasks: Task[],
    currentDiary: DiaryEntry[],
    currentGoals: WeeklyGoal[],
    appStateHandlers: AppStateHandlers,
    chatHistory?: AiChatMessage[]
  ): Promise<{ responseText: string; executedTools: Array<{ name: string; description: string; details?: string }> }> {
    if (!this.apiKey) {
      throw new Error('Google Gemini API Key is missing. Please configure your key in App Settings.');
    }

    const ai = new GoogleGenAI({ apiKey: this.apiKey });

    const recentHistoryText = chatHistory && chatHistory.length > 0
      ? chatHistory
          .slice(-8)
          .map((m) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
          .join('\n')
      : 'No prior conversation.';

    const contextPrompt = `
You are MindAssistant, an intelligent personal productivity AI Copilot embedded inside the MindFlow personal desktop application.
The user relies on you to help manage their Diary/Journal, Tasks, and Weekly Schedule.

You have direct capability to execute ACTIONS on the app using your provided function tools!
Whenever the user asks you to create a task, complete/delete a task, record a note/diary, delete a diary, or plan/toggle weekly goals, YOU MUST CALL THE APPROPRIATE TOOL(S).

Current App State Context:
- Active Tasks (${currentTasks.length}):
${currentTasks.length > 0 ? currentTasks.map((t) => `  * [ID: ${t.id}] "${t.title}" (Status: ${t.status}, Category: ${t.category}, Priority: ${t.priority}, Scheduled: ${t.scheduledDay || 'Unscheduled'})`).join('\n') : '  (No tasks)'}

- Recent Diary Entries (${currentDiary.length}):
${currentDiary.length > 0 ? currentDiary.slice(0, 5).map((d) => `  * [ID: ${d.id} | Date: ${d.date}] "${d.title}" (Mood: ${d.mood})`).join('\n') : '  (No diary entries)'}

- Weekly Goals (${currentGoals.length}):
${currentGoals.length > 0 ? currentGoals.map((g) => `  * [ID: ${g.id} | ${g.completed ? 'Done' : 'Pending'}] "${g.title}"`).join('\n') : '  (No goals)'}

Recent Chat Context:
${recentHistoryText}

Instructions:
- Be concise, supportive, structured, and helpful.
- Format your response clearly using markdown where applicable.
- When executing function tools, confirm what changes you made.
`;

    const executedTools: Array<{ name: string; description: string; details?: string }> = [];

    try {
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: [
          { role: 'user', parts: [{ text: `${contextPrompt}\n\nUser Message: ${userMessage}` }] }
        ],
        config: {
          tools: [{
            functionDeclarations: [
              createTaskDeclaration,
              updateTaskStatusDeclaration,
              deleteTaskDeclaration,
              createDiaryEntryDeclaration,
              deleteDiaryEntryDeclaration,
              planWeeklyGoalsDeclaration,
              toggleWeeklyGoalDeclaration,
            ]
          }]
        }
      });

      let responseText = response.text || '';
      const functionCalls = response.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          const args = call.args as any;

          if (call.name === 'create_task') {
            const newTask = appStateHandlers.addTask({
              title: args.title,
              description: args.description || '',
              category: (args.category as TaskCategory) || 'General',
              priority: (args.priority as Priority) || 'medium',
              scheduledDay: (args.scheduledDay as WeekDay) || null,
              status: 'todo',
            });
            executedTools.push({
              name: 'create_task',
              description: `Created task "${newTask.title}"`,
              details: `Category: ${newTask.category} | Priority: ${newTask.priority} | Scheduled: ${newTask.scheduledDay || 'Unscheduled'}`,
            });
          } else if (call.name === 'update_task_status') {
            const success = appStateHandlers.updateTask(args.taskQuery, args.status);
            executedTools.push({
              name: 'update_task_status',
              description: `Updated status of task matching "${args.taskQuery}" to ${args.status}`,
              details: success ? 'Status updated in workspace.' : 'Task not found in active list.',
            });
          } else if (call.name === 'delete_task') {
            const success = appStateHandlers.deleteTask ? appStateHandlers.deleteTask(args.taskQuery) : false;
            executedTools.push({
              name: 'delete_task',
              description: `Removed task matching "${args.taskQuery}"`,
              details: success ? 'Task deleted successfully.' : 'No matching task found.',
            });
          } else if (call.name === 'create_diary_entry') {
            const entry = appStateHandlers.addDiary({
              title: args.title,
              content: args.content,
              mood: (args.mood as MoodType) || 'productive',
              tags: args.tags || ['AI Created'],
            });
            executedTools.push({
              name: 'create_diary_entry',
              description: `Saved diary entry "${entry.title}"`,
              details: `Mood: ${entry.mood} | Tags: ${(entry.tags || []).join(', ')}`,
            });
          } else if (call.name === 'delete_diary_entry') {
            const success = appStateHandlers.deleteDiary ? appStateHandlers.deleteDiary(args.diaryQuery) : false;
            executedTools.push({
              name: 'delete_diary_entry',
              description: `Deleted diary entry matching "${args.diaryQuery}"`,
              details: success ? 'Diary entry deleted.' : 'No matching entry found.',
            });
          } else if (call.name === 'plan_weekly_goals') {
            if (Array.isArray(args.goals)) {
              appStateHandlers.addGoals(args.goals);
              executedTools.push({
                name: 'plan_weekly_goals',
                description: `Added ${args.goals.length} new weekly goal(s)`,
                details: args.goals.join(' • '),
              });
            }
          } else if (call.name === 'toggle_weekly_goal') {
            const success = appStateHandlers.toggleGoal ? appStateHandlers.toggleGoal(args.goalQuery) : false;
            executedTools.push({
              name: 'toggle_weekly_goal',
              description: `Toggled completion for goal matching "${args.goalQuery}"`,
              details: success ? 'Goal state updated.' : 'Goal not found.',
            });
          }
        }

        if (!responseText && executedTools.length > 0) {
          responseText = `Done! I've updated your workspace based on your request:\n` +
            executedTools.map(t => `- **${t.description}** (${t.details})`).join('\n');
        }
      }

      return {
        responseText: responseText || "I've processed your request and synchronized your MindFlow workspace.",
        executedTools,
      };
    } catch (err: any) {
      console.error('Gemini Copilot Error:', err);
      const rawMessage = err.message || 'Failed to communicate with Gemini API.';
      if (rawMessage.includes('API key')) {
        throw new Error('Invalid or missing Google Gemini API Key. Please verify key in Settings.');
      }
      throw new Error(rawMessage);
    }
  }

  public async validateApiKey(): Promise<boolean> {
    if (!this.apiKey || !this.apiKey.trim()) return false;
    try {
      const ai = new GoogleGenAI({ apiKey: this.apiKey.trim() });
      const res = await ai.models.generateContent({
        model: this.modelName,
        contents: 'Ping',
      });
      return Boolean(res && (res.text || res.candidates));
    } catch (err) {
      console.warn('API Key validation failed:', err);
      return false;
    }
  }
}


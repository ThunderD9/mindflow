import React, { useState, useMemo } from 'react';
import { 
  PlusIcon, 
  CheckCircle2Icon, 
  CircleIcon, 
  Trash2Icon, 
  FilterIcon, 
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PaperclipIcon,
  CalendarIcon,
  LayersIcon,
  ArrowUpDownIcon,
  Edit2Icon
} from 'lucide-react';
import { Task, TaskCategory, Priority, WeekDay } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { MediaAttachments } from './MediaAttachments';
import { cn } from '@/lib/utils';

interface TaskBoardProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onOpenAiWithPrompt?: (prompt: string) => void;
}

type SortOption = 'priority' | 'time' | 'category' | 'title' | 'date';

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onOpenAiWithPrompt,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('Work');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium');
  const [selectedDay, setSelectedDay] = useState<WeekDay | ''>('Mon');
  const [activeFilter, setActiveFilter] = useState<'all' | 'todo' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [weekdayFilter, setWeekdayFilter] = useState<'All Days' | WeekDay>('All Days');
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitleBuffer, setEditTitleBuffer] = useState('');

  const categories = ['All', 'Work', 'Personal', 'Health', 'Learning', 'Ideas'];
  const weekdays: ('All Days' | WeekDay)[] = ['All Days', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDayShort = new Date().toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3) as WeekDay;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      description: '',
      category: selectedCategory,
      priority: selectedPriority,
      status: 'todo',
      scheduledDay: selectedDay || undefined,
      attachments: [],
    });
    setNewTitle('');
  };

  const sortedAndFilteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (activeFilter === 'todo' && task.status === 'completed') return false;
        if (activeFilter === 'completed' && task.status !== 'completed') return false;
        if (categoryFilter !== 'All' && task.category !== categoryFilter) return false;
        if (weekdayFilter !== 'All Days') {
          const taskDay = task.scheduledDay || 'Mon';
          if (taskDay !== weekdayFilter) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const weights: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (weights[b.priority] || 0) - (weights[a.priority] || 0);
        }
        if (sortBy === 'time') {
          const dayOrder: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
          const dayA = dayOrder[a.scheduledDay || 'Mon'] || 99;
          const dayB = dayOrder[b.scheduledDay || 'Mon'] || 99;
          if (dayA !== dayB) return dayA - dayB;
          return (a.time || '').localeCompare(b.time || '');
        }
        if (sortBy === 'category') return a.category.localeCompare(b.category);
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'date') return (b.createdAt || '').localeCompare(a.createdAt || '');
        return 0;
      });
  }, [tasks, activeFilter, categoryFilter, weekdayFilter, sortBy]);

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30">Urgent</Badge>;
      case 'high':
        return <Badge variant="outline" className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="font-mono text-xs font-medium px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30">Medium</Badge>;
      default:
        return <Badge variant="outline" className="font-mono text-xs font-medium px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/60">Low</Badge>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto font-sans space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-zinc-100 flex items-center gap-2.5 font-heading">
            <LayersIcon className="size-6 text-zinc-300" aria-hidden="true" />
            <span>Task Matrix</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1.5 leading-normal">
            Organized high-leverage action items with full priority and weekday sorting.
          </p>
        </div>

        {onOpenAiWithPrompt && (
          <Button
            type="button"
            size="sm"
            onClick={() => {
              const openList = tasks.filter(t => t.status !== 'completed').map(t => `[${t.priority}] ${t.title}`).join('\n');
              onOpenAiWithPrompt(`As my Startup Founder AI Copilot, audit my task list:\n\n${openList}`);
            }}
            className="h-10 px-4 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold text-sm rounded-xl inline-flex items-center gap-2 shadow-xs shrink-0 transition-all duration-200"
          >
            <SparklesIcon className="size-4 text-zinc-950" aria-hidden="true" />
            <span>AI Task Audit</span>
          </Button>
        )}
      </div>

      {/* Creation Console (Sleek Vercel-style input) */}
      <div className="relative group z-10">
        <form onSubmit={handleSubmit} className="flex items-center bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 rounded-xl overflow-hidden focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700 transition-all shadow-sm">
          <Input
            placeholder="Add a new action item..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="h-12 text-sm bg-transparent border-0 text-zinc-100 placeholder:text-zinc-500 flex-1 px-4 focus-visible:ring-0 rounded-none shadow-none"
          />

          <div className="flex items-center pr-2 gap-2">
            <Select value={selectedDay || ''} onValueChange={(val) => setSelectedDay(val as WeekDay)}>
              <SelectTrigger className="h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-200 hover:bg-zinc-800 px-3 transition-colors shadow-xs">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mon">Mon</SelectItem>
                <SelectItem value="Tue">Tue</SelectItem>
                <SelectItem value="Wed">Wed</SelectItem>
                <SelectItem value="Thu">Thu</SelectItem>
                <SelectItem value="Fri">Fri</SelectItem>
                <SelectItem value="Sat">Sat</SelectItem>
                <SelectItem value="Sun">Sun</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val as TaskCategory)}>
              <SelectTrigger className="h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-200 hover:bg-zinc-800 px-3 transition-colors shadow-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Health">Health</SelectItem>
                <SelectItem value="Learning">Learning</SelectItem>
                <SelectItem value="Ideas">Ideas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPriority} onValueChange={(val) => setSelectedPriority(val as Priority)}>
              <SelectTrigger className="h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-200 hover:bg-zinc-800 px-3 transition-colors shadow-xs">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medium">Med</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <div className="w-px h-4 bg-zinc-800 mx-0.5"></div>

            <Button type="submit" disabled={!newTitle.trim()} variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg">
              <PlusIcon className="size-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Weekday Switcher Bar (Filter by Specific Weekday or All Days) */}
      <Card className="bg-zinc-900/40 border border-zinc-800 p-2 rounded-2xl shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[640px] gap-1.5">
          {weekdays.map((day) => {
            const count = day === 'All Days'
              ? tasks.filter(t => t.status !== 'completed').length
              : tasks.filter(t => (t.scheduledDay === day || (!t.scheduledDay && day === 'Mon')) && t.status !== 'completed').length;
            
            const isActive = weekdayFilter === day;
            const isToday = currentDayShort === day;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setWeekdayFilter(day)}
                className={cn(
                  'flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 select-none whitespace-nowrap',
                  isActive 
                    ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm' 
                    : isToday 
                    ? 'border border-zinc-700 text-zinc-200 font-semibold bg-zinc-900' 
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                )}
              >
                <span>{day}</span>
                {isToday && !isActive && <span className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300">Today</span>}
                {count > 0 && (
                  <span className={cn(
                    'text-xs tabular-nums px-2 py-0.5 rounded-full font-semibold',
                    isActive ? 'bg-zinc-900 text-zinc-200' : 'bg-zinc-800 text-zinc-400'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Filter & Sort Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-1">
        <Tabs value={activeFilter} onValueChange={(val: any) => setActiveFilter(val)}>
          <TabsList className="h-10 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 shadow-xs gap-1">
            <TabsTrigger value="all" className="text-xs rounded-lg px-3.5 h-8 font-semibold data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 data-[state=active]:border data-[state=active]:border-zinc-700 transition-all">
              All Status
            </TabsTrigger>
            <TabsTrigger value="todo" className="text-xs rounded-lg px-3.5 h-8 font-semibold data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 data-[state=active]:border data-[state=active]:border-amber-500/30 transition-all">
              Open
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs rounded-lg px-3.5 h-8 font-semibold data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 data-[state=active]:border data-[state=active]:border-emerald-500/30 transition-all">
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <FilterIcon className="size-4 text-zinc-500 mr-1 shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  'h-8 px-3 rounded-lg text-sm font-medium transition-colors shrink-0',
                  categoryFilter === cat ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-xl text-sm shadow-xs">
            <ArrowUpDownIcon className="size-3.5 text-zinc-400" />
            <span className="text-xs text-zinc-400 font-medium">Sort:</span>
            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger className="h-7 border-transparent bg-transparent text-xs text-zinc-200 font-medium px-1 focus:ring-0 shadow-none">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="time">Time</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Task List Items (Smooth rounded-xl, 14px font size, clean shadcn structure) */}
      {sortedAndFilteredTasks.length === 0 ? (
        <Card className="p-12 text-center bg-zinc-900/20 border border-zinc-800/60 rounded-2xl">
          <p className="text-sm text-zinc-500">No tasks match the selected weekday ({weekdayFilter}) or active filters.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedAndFilteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isExpanded = expandedTaskId === task.id;

            return (
              <Card 
                key={task.id} 
                className={cn(
                  'bg-zinc-900/40 border transition-all duration-200 p-3 rounded-lg shadow-sm hover:shadow-md', 
                  isCompleted ? 'border-zinc-900 opacity-60' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/60'
                )}
              >
                <div onClick={() => setExpandedTaskId(isExpanded ? null : task.id)} className="flex items-center justify-between gap-4 cursor-pointer select-none">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateTask(task.id, { status: isCompleted ? 'todo' : 'completed' });
                      }}
                      className="text-zinc-500 hover:text-zinc-200 transition-colors focus:outline-none shrink-0"
                    >
                      {isCompleted ? <CheckCircle2Icon className="size-5 text-emerald-500" /> : <CircleIcon className="size-5 text-zinc-500 hover:text-zinc-300" />}
                    </button>

                    <div className="min-w-0 flex-1 flex items-center gap-2.5 flex-wrap" onClick={(e) => {
                      if (editingTaskId === task.id) e.stopPropagation();
                    }}>
                      {editingTaskId === task.id ? (
                        <input
                          autoFocus
                          value={editTitleBuffer}
                          onChange={(e) => setEditTitleBuffer(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              onUpdateTask(task.id, { title: editTitleBuffer });
                              setEditingTaskId(null);
                            }
                            if (e.key === 'Escape') {
                              setEditingTaskId(null);
                            }
                          }}
                          onBlur={() => {
                            onUpdateTask(task.id, { title: editTitleBuffer });
                            setEditingTaskId(null);
                          }}
                          className="h-7 px-2 text-sm font-semibold rounded-md bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                        />
                      ) : (
                        <span className={cn('text-sm font-semibold truncate tracking-tight leading-none', isCompleted ? 'line-through text-zinc-500 font-normal' : 'text-zinc-100')}>
                          {task.title}
                        </span>
                      )}
                      {getPriorityBadge(task.priority)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {task.attachments && task.attachments.length > 0 && (
                      <Badge variant="outline" className="text-xs font-mono rounded-md bg-zinc-900 border-zinc-800 text-zinc-400 gap-1 px-2 py-0.5">
                        <PaperclipIcon className="size-3" />
                        <span>{task.attachments.length}</span>
                      </Badge>
                    )}
                    {task.scheduledDay && (
                      <span className="text-xs font-mono bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md text-zinc-300 font-medium">
                        {task.scheduledDay} {task.time || ''}
                      </span>
                    )}
                    <Badge variant="outline" className="text-xs rounded-md bg-zinc-900 border-zinc-800 text-zinc-300 px-2.5 py-0.5 font-medium">
                      {task.category}
                    </Badge>
                    
                    <button
                      type="button"
                      title="Edit task title"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditTitleBuffer(task.title);
                        setEditingTaskId(task.id);
                      }}
                      className="text-zinc-500 hover:text-zinc-200 p-1 rounded-md transition-colors"
                    >
                      <Edit2Icon className="size-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTask(task.id);
                      }}
                      className="text-zinc-500 hover:text-rose-400 p-1 rounded-md transition-colors"
                      title="Delete task"
                    >
                      <Trash2Icon className="size-4" />
                    </button>
                    {isExpanded ? <ChevronUpIcon className="size-4 text-zinc-400" /> : <ChevronDownIcon className="size-4 text-zinc-500" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-3" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-zinc-400 block font-medium">Task Notes & Execution Details</label>
                      <textarea
                        rows={3}
                        value={task.description || ''}
                        onChange={(e) => onUpdateTask(task.id, { description: e.target.value })}
                        placeholder="Add specific instructions, links, or notes for this task..."
                        className="w-full text-sm p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder:text-zinc-500 font-sans focus:outline-none focus:ring-1 focus:ring-zinc-700 leading-relaxed resize-y"
                      />
                    </div>

                    <div className="pt-2 border-t border-zinc-800/50">
                      <MediaAttachments
                        attachments={task.attachments || []}
                        onAddAttachment={(newAtt) => {
                          const created = { ...newAtt, id: 'att-' + Date.now(), createdAt: new Date().toISOString() };
                          onUpdateTask(task.id, { attachments: [...(task.attachments || []), created] });
                        }}
                        onRemoveAttachment={(attId) => {
                          onUpdateTask(task.id, { attachments: (task.attachments || []).filter(a => a.id !== attId) });
                        }}
                        compact={false}
                      />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

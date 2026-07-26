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
  Edit2Icon,
  XCircleIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-react';
import { format, addDays, startOfWeek, isToday, isSameDay, addWeeks, isSameMonth, isSameYear } from 'date-fns';
import { Task, TaskCategory, Priority, WeekDay } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { MediaAttachments } from './MediaAttachments';
import { cn, getEffectiveDate } from '@/lib/utils';

interface TaskBoardProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onOpenAiWithPrompt?: (prompt: string) => void;
  viewDate?: Date;
  setViewDate?: (date: Date) => void;
}

type SortOption = 'priority' | 'time' | 'category' | 'title' | 'date';

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onOpenAiWithPrompt,
  viewDate = new Date(),
  setViewDate,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('Work');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium');
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'todo' | 'completed' | 'failed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('This Week');
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitleBuffer, setEditTitleBuffer] = useState('');

  const categories = ['All', 'Work', 'Personal', 'Health', 'Learning', 'Ideas'];
  
  const weekStart = startOfWeek(viewDate, { weekStartsOn: 1 });
  const scheduleDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [viewDate, weekStart]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let computedScheduledDay: WeekDay | undefined = undefined;
    if (selectedDateStr) {
      computedScheduledDay = format(new Date(selectedDateStr), 'EEE') as WeekDay;
    }

    onAddTask({
      title: newTitle.trim(),
      description: '',
      category: selectedCategory,
      priority: selectedPriority,
      status: 'todo',
      scheduledDay: computedScheduledDay,
      date: selectedDateStr || undefined,
      attachments: [],
    });
    setNewTitle('');
  };

  const sortedAndFilteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (activeFilter !== 'all') {
          if (activeFilter === 'todo' && (t.status === 'completed' || t.status === 'failed')) return false;
          if (activeFilter === 'completed' && t.status !== 'completed') return false;
          if (activeFilter === 'failed' && t.status !== 'failed') return false;
        }
        if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
        
        const effectiveDate = getEffectiveDate(t);
        
        if (dateFilter === 'This Week') {
          const weekDatesStr = scheduleDates.map(d => format(d, 'yyyy-MM-dd'));
          return weekDatesStr.includes(effectiveDate);
        } else if (dateFilter === 'This Month') {
          return isSameMonth(new Date(effectiveDate), viewDate || new Date());
        } else if (dateFilter === 'This Year') {
          return isSameYear(new Date(effectiveDate), viewDate || new Date());
        } else if (dateFilter !== 'All Time') {
          return effectiveDate === dateFilter;
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
  }, [tasks, activeFilter, categoryFilter, dateFilter, sortBy, viewDate, scheduleDates]);

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

      <div className="flex items-center justify-between mb-3 mt-6">
        <div className="flex items-center gap-4 text-zinc-400 font-medium">
          <button onClick={() => {
            if (setViewDate) {
              setViewDate(addWeeks(viewDate, -1));
              if (!['This Week', 'This Month', 'This Year', 'All Time'].includes(dateFilter)) {
                setDateFilter('This Week');
              }
            }
          }} className="hover:text-zinc-100 p-1.5 hover:bg-zinc-900 rounded-md transition-colors"><ChevronLeftIcon className="size-4" /></button>
          <span className="text-sm font-sans tracking-tight w-32 text-center text-zinc-300 select-none">
            Week of {format(weekStart, 'MMM d')}
          </span>
          <button onClick={() => {
            if (setViewDate) {
              setViewDate(addWeeks(viewDate, 1));
              if (!['This Week', 'This Month', 'This Year', 'All Time'].includes(dateFilter)) {
                setDateFilter('This Week');
              }
            }
          }} className="hover:text-zinc-100 p-1.5 hover:bg-zinc-900 rounded-md transition-colors"><ChevronRightIcon className="size-4" /></button>
        </div>
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
            <Select value={selectedDateStr || ''} onValueChange={setSelectedDateStr}>
              <SelectTrigger className="h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-200 hover:bg-zinc-800 px-3 transition-colors shadow-xs">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unscheduled</SelectItem>
                {scheduleDates.map(date => (
                  <SelectItem key={format(date, 'yyyy-MM-dd')} value={format(date, 'yyyy-MM-dd')}>
                    {format(date, 'EEE, MMM d')}
                  </SelectItem>
                ))}
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

      {/* Weekday Switcher Bar (Filter by Specific Date or All Days) */}
      <Card className="bg-zinc-900/40 border border-zinc-800 p-2 rounded-2xl shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[640px] gap-1.5">
          {(() => {
            const thisWeekCount = tasks.filter(t => {
              if (t.status === 'completed' || t.status === 'failed') return false;
              const weekDatesStr = scheduleDates.map(d => format(d, 'yyyy-MM-dd'));
              return weekDatesStr.includes(getEffectiveDate(t));
            }).length;
            
            const thisMonthCount = tasks.filter(t => {
              if (t.status === 'completed' || t.status === 'failed') return false;
              return isSameMonth(new Date(getEffectiveDate(t)), viewDate || new Date());
            }).length;

            const thisYearCount = tasks.filter(t => {
              if (t.status === 'completed' || t.status === 'failed') return false;
              return isSameYear(new Date(getEffectiveDate(t)), viewDate || new Date());
            }).length;
            
            const allTimeCount = tasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length;
            
            const isAllTimeActive = dateFilter === 'All Time';
            const isThisWeekActive = dateFilter === 'This Week';
            const isThisMonthActive = dateFilter === 'This Month';
            const isThisYearActive = dateFilter === 'This Year';
            
            const activeFilterText = isAllTimeActive ? "All Time" : isThisYearActive ? "This Year" : isThisMonthActive ? "This Month" : "This Week";
            const isAnyAllActive = isAllTimeActive || isThisWeekActive || isThisMonthActive || isThisYearActive;
            
            let displayCount = thisWeekCount;
            if (isAllTimeActive) displayCount = allTimeCount;
            if (isThisMonthActive) displayCount = thisMonthCount;
            if (isThisYearActive) displayCount = thisYearCount;
            
            return (
              <button
                type="button"
                onClick={() => setDateFilter('This Week')}
                className={cn(
                  'flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 select-none whitespace-nowrap outline-none',
                  isAnyAllActive ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                )}
              >
                <span>{activeFilterText}</span>
                {displayCount > 0 && (
                  <span className={cn('text-xs tabular-nums px-2 py-0.5 rounded-full font-semibold ml-0.5', isAnyAllActive ? 'bg-zinc-900 text-zinc-200' : 'bg-zinc-800 text-zinc-400')}>
                    {displayCount}
                  </span>
                )}
              </button>
            );
          })()}
          <div className="w-px h-6 bg-zinc-800 mx-1 shrink-0"></div>
          {scheduleDates.map((dayDate) => {
            const dayStr = format(dayDate, 'yyyy-MM-dd');
            const dayShort = format(dayDate, 'EEE') as WeekDay;
            
            const count = tasks.filter(t => {
              return getEffectiveDate(t) === dayStr && (t.status === 'todo' || t.status === 'in_progress');
            }).length;
            
            const isActive = dateFilter === dayStr;
            const isActualToday = isToday(dayDate);

            return (
              <button
                key={dayStr}
                type="button"
                onClick={() => setDateFilter(dayStr)}
                className={cn(
                  'flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 select-none whitespace-nowrap',
                  isActive 
                    ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm' 
                    : isActualToday 
                    ? 'border border-zinc-700 text-zinc-200 font-semibold bg-zinc-900' 
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                )}
              >
                <div className="flex flex-col items-center gap-0">
                  <span className="leading-tight flex items-center gap-1.5">
                    {dayShort}
                    {isActualToday && (
                      <div className="size-1.5 rounded-full bg-indigo-500 shadow-sm" />
                    )}
                  </span>
                  <span className={cn("text-[10px] font-mono", isActive ? "text-zinc-500" : "text-zinc-500")}>{format(dayDate, 'MMM d')}</span>
                </div>
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
        <div className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 shadow-xs gap-1 h-10">
          
          {/* Split Button for 'All Status' */}
          <div className={cn(
            "flex items-center rounded-lg h-8 transition-all border",
            activeFilter === 'all' 
              ? "bg-zinc-800 border-zinc-700 shadow-sm" 
              : "border-transparent"
          )}>
            <button
              onClick={() => setActiveFilter('all')}
              className={cn(
                "h-full px-3 text-xs font-semibold whitespace-nowrap transition-colors outline-none flex items-center justify-center rounded-l-lg",
                activeFilter === 'all' ? "text-zinc-100" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30"
              )}
            >
              {dateFilter === 'This Month' ? 'All (Month)' : dateFilter === 'This Year' ? 'All (Year)' : dateFilter === 'All Time' ? 'All (All Time)' : 'All (Week)'}
            </button>
            <div className={cn("w-px h-4", activeFilter === 'all' ? "bg-zinc-700" : "bg-zinc-800")} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "h-full px-1.5 flex items-center justify-center transition-colors outline-none rounded-r-lg",
                    activeFilter === 'all' ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
                  )}
                >
                  <ChevronDownIcon className="size-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40 border-zinc-800 bg-zinc-950 text-zinc-300 rounded-xl p-1 shadow-lg">
                <DropdownMenuItem onClick={() => { setActiveFilter('all'); setDateFilter('This Week'); }} className={cn("cursor-pointer rounded-lg px-3 py-2 text-sm", dateFilter === 'This Week' && "bg-zinc-800 text-zinc-100 font-medium")}>
                  All (This Week)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setActiveFilter('all'); setDateFilter('This Month'); }} className={cn("cursor-pointer rounded-lg px-3 py-2 text-sm", dateFilter === 'This Month' && "bg-zinc-800 text-zinc-100 font-medium")}>
                  All (Month)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setActiveFilter('all'); setDateFilter('This Year'); }} className={cn("cursor-pointer rounded-lg px-3 py-2 text-sm", dateFilter === 'This Year' && "bg-zinc-800 text-zinc-100 font-medium")}>
                  All (Year)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setActiveFilter('all'); setDateFilter('All Time'); }} className={cn("cursor-pointer rounded-lg px-3 py-2 text-sm", dateFilter === 'All Time' && "bg-zinc-800 text-zinc-100 font-medium")}>
                  All (All Time)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <button
            onClick={() => setActiveFilter('todo')}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap text-xs rounded-lg px-3 h-8 font-semibold transition-all outline-none",
              activeFilter === 'todo' 
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm" 
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            Open
          </button>
          
          <button
            onClick={() => setActiveFilter('completed')}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap text-xs rounded-lg px-3 h-8 font-semibold transition-all outline-none",
              activeFilter === 'completed' 
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm" 
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            Completed
          </button>
          
          <button
            onClick={() => setActiveFilter('failed')}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap text-xs rounded-lg px-3 h-8 font-semibold transition-all outline-none",
              activeFilter === 'failed' 
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm" 
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            Skipped
          </button>
        </div>

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
          <p className="text-sm text-zinc-500">No tasks match the selected date ({dateFilter}) or active filters.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedAndFilteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isFailed = task.status === 'failed';
            const isExpanded = expandedTaskId === task.id;

            return (
              <Card 
                key={task.id} 
                className={cn(
                  'bg-zinc-900/40 border transition-all duration-200 p-3 rounded-lg shadow-sm hover:shadow-md', 
                  (isCompleted || isFailed) ? 'border-zinc-900 opacity-60' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/60'
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
                      {isCompleted ? (
                        <CheckCircle2Icon className="size-5 text-emerald-500" />
                      ) : isFailed ? (
                        <XCircleIcon className="size-5 text-rose-500" />
                      ) : (
                        <CircleIcon className="size-5 text-zinc-600 group-hover:text-zinc-400" />
                      )}
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
                        <span className={cn('text-sm font-semibold truncate tracking-tight leading-none', isCompleted ? 'line-through text-zinc-500 font-normal' : isFailed ? 'line-through text-rose-500/70 font-normal' : 'text-zinc-100')}>
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
                      title="Mark as Skipped / Cancelled"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateTask(task.id, { status: isFailed ? 'todo' : 'failed' });
                      }}
                      className="text-zinc-500 hover:text-rose-400 p-1 rounded-md transition-colors"
                    >
                      <XIcon className="size-4" />
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

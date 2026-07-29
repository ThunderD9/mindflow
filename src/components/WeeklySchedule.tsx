import React, { useState } from 'react';
import { 
  CalendarIcon, 
  PlusIcon, 
  SparklesIcon, 
  CheckCircle2Icon, 
  CircleIcon, 
  Trash2Icon,
  TargetIcon,
  ChevronRightIcon,
  XCircleIcon,
  XIcon,
  ChevronLeftIcon,
  CheckIcon,
  MinusCircleIcon
} from 'lucide-react';
import { format, addWeeks, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { Task, Goal, WeekDay } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { cn, getEffectiveDate } from '@/lib/utils';

interface WeeklyScheduleProps {
  tasks: Task[];
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onOpenAiWithPrompt?: (prompt: string) => void;
  viewDate?: Date;
  setViewDate?: (date: Date) => void;
}

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  tasks,
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onOpenAiWithPrompt,
  viewDate = new Date(),
  setViewDate,
}) => {
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('By End of Week');
  
  // Quick Add Task State
  const [quickAddDayStr, setQuickAddDayStr] = useState<string | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [quickAddTime, setQuickAddTime] = useState('09:00 AM');

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    onAddGoal({
      title: newGoalTitle.trim(),
      targetDate: newGoalTarget || 'By End of Week',
      status: 'in_progress',
      milestones: [],
      progress: 0,
    });
    setNewGoalTitle('');
  };

  return (
    <div className="max-w-6xl mx-auto font-sans space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-zinc-100 flex items-center gap-2.5 font-heading">
            <CalendarIcon className="size-6 text-zinc-300" aria-hidden="true" />
            <span>Weekly Schedule & Strategic Goals</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1.5 leading-normal font-sans">
            Oversee your complete 7-day operating schedule alongside core executive targets.
          </p>
        </div>

        {onOpenAiWithPrompt && (
          <Button
            type="button"
            size="sm"
            onClick={() => {
              const goalsText = goals.map(g => `[Goal: ${g.status}] ${g.title} (${g.targetDate})`).join('\n');
              const weekText = tasks.map(t => `${t.scheduledDay || 'Mon'}: ${t.title}`).join('\n');
              onOpenAiWithPrompt(`As my Startup Founder AI Copilot, align my weekly schedule with my overarching weekly goals. Suggest priority reallocations:\n\nGoals:\n${goalsText}\n\nSchedule:\n${weekText}`);
            }}
            className="h-10 px-4 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold text-sm rounded-xl inline-flex items-center gap-2 shadow-xs transition-all duration-200 shrink-0"
          >
            <SparklesIcon className="size-4 text-zinc-950" aria-hidden="true" />
            <span>AI Align Weekly Plan</span>
          </Button>
        )}
      </div>

      {/* Top Half: Core Weekly Objectives (Smooth rounded-2xl Container) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2 font-heading">
            <TargetIcon className="size-5 text-indigo-400" />
            <span>Core Executive Objectives</span>
          </h2>
          <Badge variant="outline" className="font-mono text-xs px-3 py-1 rounded-md bg-zinc-900 border-zinc-800 text-zinc-300 font-semibold">
            {goals.filter(g => g.status === 'completed').length} / {goals.length} Completed
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Goal Creator */}
          <Card className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-100 tracking-tight font-heading mb-1.5">Add Executive Goal</h3>
              <p className="text-xs text-zinc-400 font-sans leading-normal">Define high-leverage outcomes for this seven-day operational sprint.</p>
            </div>

            <form onSubmit={handleAddGoalSubmit} className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Objective Title</label>
                <Input
                  placeholder="e.g., Launch V1 beta test..."
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="h-9 text-sm bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 rounded-xl px-3"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Target Milestone / Timeframe</label>
                <Input
                  placeholder="e.g., By Thursday COB"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  className="h-9 text-sm font-mono bg-zinc-950 border-zinc-800 text-zinc-300 rounded-xl px-3"
                />
              </div>

              <Button type="submit" disabled={!newGoalTitle.trim()} className="w-full h-10 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-sm rounded-xl shadow-xs transition-all mt-1">
                <PlusIcon className="size-4 mr-2" />
                <span>Register Goal</span>
              </Button>
            </form>
          </Card>

          {/* Goals List Stream */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.length === 0 ? (
              <Card className="col-span-2 bg-zinc-900/20 border-zinc-800/60 rounded-2xl p-10 text-center text-zinc-500 text-sm font-sans flex items-center justify-center italic">
                No weekly executive objectives set yet. Add your targets on the left.
              </Card>
            ) : (
              goals.map((goal) => {
                const isDone = goal.status === 'completed';

                return (
                  <Card 
                    key={goal.id} 
                    className={cn(
                      'p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md',
                      isDone ? 'bg-zinc-900/30 border-zinc-900 opacity-60' : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => onUpdateGoal(goal.id, { status: isDone ? 'in_progress' : 'completed' })}
                          className="shrink-0 pt-0.5 text-zinc-500 hover:text-zinc-200 transition-colors focus:outline-none"
                        >
                          {isDone ? <CheckCircle2Icon className="size-5 text-emerald-400" /> : <CircleIcon className="size-5 text-zinc-500 hover:text-zinc-300" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <h4 className={cn('text-sm font-semibold tracking-tight leading-snug', isDone ? 'line-through text-zinc-500 font-normal' : 'text-zinc-100')}>
                            {goal.title}
                          </h4>
                          <span className="text-xs font-mono text-zinc-400 inline-block mt-1">
                            🎯 {goal.targetDate || 'This week'}
                          </span>
                        </div>

                        <button
                          type="button"
                          title="Delete goal"
                          onClick={() => onDeleteGoal(goal.id)}
                          className="text-zinc-500 hover:text-rose-400 p-1 rounded-md transition-colors"
                        >
                          <Trash2Icon className="size-4" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono text-zinc-400">
                      <Badge variant="outline" className={cn('text-xs rounded-md px-2.5 py-0.5 font-medium', isDone ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20')}>
                        {isDone ? 'Completed' : 'In Progress'}
                      </Badge>
                      <span className="text-zinc-500">{isDone ? '100%' : 'Active Sprint'}</span>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Half: 7-Day Focus Schedule */}
      <div className="space-y-6 pt-8 mt-8 border-t border-zinc-800/80">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight font-heading">
            <span>Operational Schedule</span>
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewDate && setViewDate(addWeeks(viewDate, -1))}
              className="p-1.5 hover:bg-zinc-900 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ChevronLeftIcon className="size-3.5" />
            </button>
            <span className="text-xs font-medium font-sans text-zinc-400 min-w-[100px] text-center select-none">
              Week of {format(startOfWeek(viewDate, { weekStartsOn: 1 }), 'MMM d')}
            </span>
            <button
              onClick={() => setViewDate && setViewDate(addWeeks(viewDate, 1))}
              className="p-1.5 hover:bg-zinc-900 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ChevronRightIcon className="size-3.5" />
            </button>
          </div>
        </div>

        {(() => {
          const weekStart = startOfWeek(viewDate, { weekStartsOn: 1 });
          const scheduleDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
          
          // Helper to render a day card based on size
          const renderDayCard = (dayDate: Date, size: 'lg' | 'sm') => {
            const dayStr = format(dayDate, 'yyyy-MM-dd');
            const dayShort = format(dayDate, 'EEE') as WeekDay;
            const isActualToday = isToday(dayDate);
            const isLg = size === 'lg';

            const dayTasks = tasks.filter(t => getEffectiveDate(t) === dayStr);

            return (
              <Card 
                key={dayStr} 
                className={cn(
                  'rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col',
                  isLg ? 'h-[400px] shadow-md' : 'h-[320px] shadow-sm',
                  isActualToday ? 'bg-zinc-950/80 border-indigo-500/20 ring-1 ring-indigo-500/20' : 'bg-zinc-950/40 border-zinc-800/50 hover:border-zinc-700/80 hover:bg-zinc-950/60'
                )}
              >
                {/* Day Column Header */}
                <div className={cn(
                  'p-4 pb-3 flex items-center justify-between shrink-0 select-none border-b border-zinc-800/30',
                  isActualToday ? 'bg-indigo-500/5' : 'bg-transparent'
                )}>
                  <div className="flex items-center gap-2">
                    <span className={cn("font-bold tracking-tight text-zinc-100 font-heading", isLg ? "text-xl" : "text-base")}>{dayShort}</span>
                    <span className="text-xs font-mono text-zinc-500">{format(dayDate, 'd')}</span>
                    {isActualToday && (
                      <span className="text-[10px] font-mono uppercase font-bold bg-indigo-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                        Today
                      </span>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono font-bold bg-zinc-900/50 border-zinc-800/80 text-zinc-400 px-2 py-0 rounded-full">
                    {dayTasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length}
                  </Badge>
                </div>

                {/* Day Tasks Stream */}
                <div className="p-2 overflow-y-auto space-y-0.5 flex-1 custom-scrollbar">
                  {dayTasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-xs italic text-center p-4">
                      <div className="size-8 rounded-full bg-zinc-900/50 border border-zinc-800/50 mb-2 flex items-center justify-center">
                        <CheckCircle2Icon className="size-4 text-zinc-700" />
                      </div>
                      No tasks scheduled
                    </div>
                  ) : (
                    dayTasks.map((t) => {
                      const isCompleted = t.status === 'completed';
                      const isFailed = t.status === 'failed';
                      const isHalfCompleted = t.status === 'half_completed';

                      return (
                        <div 
                          key={t.id} 
                          className={cn(
                            'p-2.5 rounded-xl transition-all duration-150 group/item relative font-sans flex items-start gap-3',
                            isCompleted ? 'opacity-50' : isFailed ? 'opacity-50 bg-rose-950/10' : isHalfCompleted ? 'bg-yellow-950/10' : 'hover:bg-zinc-900/50'
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => onUpdateTask(t.id, { status: isCompleted ? 'todo' : 'completed' })}
                            className="shrink-0 pt-0.5 text-zinc-500 hover:text-zinc-200 transition-colors focus:outline-none"
                          >
                            {isCompleted ? <CheckCircle2Icon className="size-4 text-emerald-500" /> : isFailed ? <XCircleIcon className="size-4 text-rose-500" /> : isHalfCompleted ? <MinusCircleIcon className="size-4 text-yellow-500" /> : <CircleIcon className="size-4 text-zinc-600 hover:text-zinc-400" />}
                          </button>
                          
                          <div className="min-w-0 flex-1">
                            <p className={cn('font-medium leading-snug tracking-tight text-sm', isCompleted ? 'line-through text-zinc-500 font-normal' : isFailed ? 'line-through text-rose-500/70 font-normal' : isHalfCompleted ? 'text-yellow-100/90' : 'text-zinc-200')}>
                              {t.title}
                            </p>

                            {t.time && !isCompleted && (
                              <span className="text-[10px] font-mono text-zinc-500 block mt-1 font-medium">
                                ⌚ {t.time}
                              </span>
                            )}
                          </div>

                          <div className="opacity-0 group-hover/item:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                            <button
                              type="button"
                              title="Mark as half completed"
                              onClick={() => onUpdateTask(t.id, { status: isHalfCompleted ? 'todo' : 'half_completed' })}
                              className="text-zinc-500 hover:text-yellow-400 p-1 rounded-md bg-zinc-800/80 transition-colors"
                            >
                              <MinusCircleIcon className="size-3" />
                            </button>
                            <button
                              type="button"
                              title="Mark as Skipped / Cancelled"
                              onClick={() => onUpdateTask(t.id, { status: isFailed ? 'todo' : 'failed' })}
                              className="text-zinc-500 hover:text-rose-400 p-1 rounded-md bg-zinc-800/80 transition-colors"
                            >
                              <XIcon className="size-3" />
                            </button>
                            <button
                              type="button"
                              title="Delete task"
                              onClick={() => onDeleteTask(t.id)}
                              className="text-zinc-500 hover:text-rose-400 p-1 rounded-md bg-zinc-800/80 transition-colors"
                            >
                              <Trash2Icon className="size-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Add Footer */}
                <div className="p-2 border-t border-zinc-800/30 bg-zinc-950 shrink-0">
                  {quickAddDayStr === dayStr ? (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (quickAddTitle.trim()) {
                          onAddTask({
                            title: quickAddTitle.trim(),
                            description: '',
                            category: 'Work',
                            priority: 'medium',
                            status: 'todo',
                            scheduledDay: dayShort,
                            date: dayStr,
                            time: quickAddTime || '09:00 AM',
                            attachments: [],
                          });
                          setQuickAddTitle('');
                          setQuickAddTime('09:00 AM');
                          setQuickAddDayStr(null);
                        }
                      }}
                      className="flex flex-col gap-2"
                    >
                      <Input
                        autoFocus
                        placeholder="Task title..."
                        value={quickAddTitle}
                        onChange={(e) => setQuickAddTitle(e.target.value)}
                        className="h-8 text-xs bg-zinc-900/80 border-zinc-800 text-zinc-100 w-full"
                      />
                      <div className="flex items-center justify-between w-full gap-2">
                        <Input
                          placeholder="09:00 AM"
                          value={quickAddTime}
                          onChange={(e) => setQuickAddTime(e.target.value)}
                          className="h-8 w-24 text-[10px] bg-zinc-900/80 border-zinc-800 text-zinc-100 text-center px-1"
                        />
                        <div className="flex items-center gap-1">
                          <Button type="submit" disabled={!quickAddTitle.trim()} size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 transition-colors shrink-0">
                            <CheckIcon className="size-4" />
                          </Button>
                          <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-300 transition-colors shrink-0" onClick={() => setQuickAddDayStr(null)}>
                            ✕
                          </Button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setQuickAddDayStr(dayStr);
                        setQuickAddTitle('');
                        setQuickAddTime('09:00 AM');
                      }}
                      className="w-full h-8 text-xs font-medium text-zinc-500 hover:text-zinc-200 justify-start px-2 gap-2 rounded-lg hover:bg-zinc-900/60 transition-colors"
                    >
                      <PlusIcon className="size-3.5" />
                      <span>Add Task</span>
                    </Button>
                  )}
                </div>
              </Card>
            );
          };

          return (
            <div className="space-y-10">
              {/* Focus: Monday & Tuesday */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-400 font-heading mb-4 px-1 flex items-center gap-2">
                  <SparklesIcon className="size-4 text-zinc-500" />
                  <span>Early Week</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {renderDayCard(scheduleDates[0], 'lg')}
                  {renderDayCard(scheduleDates[1], 'lg')}
                </div>
              </div>
              
              {/* Upcoming: Rest of Week */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-400 font-heading mb-4 px-1 flex items-center gap-2">
                  <CalendarIcon className="size-4 text-zinc-500" />
                  <span>Remaining Days</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
                  {scheduleDates.slice(2).map(dayDate => renderDayCard(dayDate, 'sm'))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

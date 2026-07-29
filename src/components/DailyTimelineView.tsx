import React, { useState } from 'react';
import { 
  ClockIcon, 
  PlusIcon, 
  SparklesIcon, 
  CheckCircle2Icon, 
  CircleIcon, 
  Trash2Icon,
  PaperclipIcon,
  SunIcon,
  MoonIcon,
  Edit2Icon,
  XCircleIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MinusCircleIcon
} from 'lucide-react';
import { format, addDays, isToday, startOfWeek, isSameDay } from 'date-fns';
import { Task, WeekDay } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { MediaAttachments } from './MediaAttachments';
import { TimePicker } from './TimePicker';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getEffectiveDate } from '@/lib/utils';

interface DailyTimelineViewProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onOpenAiWithPrompt?: (prompt: string) => void;
  viewDate: Date;
  setViewDate: (date: Date) => void;
}

const HOURS_24 = Array.from({ length: 24 }, (_, i) => {
  const hour = i;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const label = `${String(displayHour).padStart(2, '0')}:00 ${ampm}`;
  return { hour, label, isWorkingHour: hour >= 6 && hour <= 23 };
});

export const DailyTimelineView: React.FC<DailyTimelineViewProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onOpenAiWithPrompt,
  viewDate,
  setViewDate
}) => {
  const [showFull24Hours, setShowFull24Hours] = useState(false);
  const selectedDay = format(viewDate, 'EEE') as WeekDay;
  const selectedDateStr = format(viewDate, 'yyyy-MM-dd');

  const [creatingForHour, setCreatingForHour] = useState<number | null>(null);
  const [customTimeInput, setCustomTimeInput] = useState<string>('');
  const [newTitle, setNewTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Work' | 'Personal' | 'Health' | 'Learning' | 'Ideas' | 'General'>('Work');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitleBuffer, setEditTitleBuffer] = useState('');
  const [dragOverHour, setDragOverHour] = useState<number | null>(null);

  const currentHour = new Date().getHours();
  const isViewingToday = isToday(viewDate);

  const displayedHours = showFull24Hours ? HOURS_24 : HOURS_24.filter(h => h.isWorkingHour);
  const dayTasks = tasks.filter(t => getEffectiveDate(t) === selectedDateStr);

  const getTasksForHour = (hourNum: number) => {
    return dayTasks.filter((t) => {
      if (!t.time) return hourNum === 9; // default unscheduled to 9am
      const clean = t.time.trim().toUpperCase();
      const displayHour = hourNum % 12 || 12;
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      
      const pattern0 = `${String(displayHour).padStart(2, '0')}:`;
      const pattern1 = `${displayHour}:`;
      
      return (clean.startsWith(pattern0) || clean.startsWith(pattern1)) && clean.includes(ampm);
    });
  };

  const formatHourTo12h = (hourNum: number) => {
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayH = hourNum % 12 || 12;
    return `${String(displayH).padStart(2, '0')}:00 ${ampm}`;
  };

  const handleStartCreating = (hourNum: number, _defaultLabel: string) => {
    setCreatingForHour(hourNum);
    setCustomTimeInput(formatHourTo12h(hourNum));
    setNewTitle('');
  };

  const handleCreateCustomSlice = (e: React.FormEvent, hourNum: number) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      description: '',
      category: selectedCategory,
      priority: 'medium',
      status: 'todo',
      scheduledDay: selectedDay,
      date: selectedDateStr,
      time: customTimeInput || formatHourTo12h(hourNum),
      durationHours: 1,
      attachments: [],
    });

    setNewTitle('');
    setCreatingForHour(null);
  };

  return (
    <div className="max-w-5xl mx-auto font-sans space-y-6 pb-16">
      {/* Header (Standard Shadcn 30px title & 14px subtitle) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-zinc-100 flex items-center gap-2.5 font-heading">
            <ClockIcon className="size-6 text-zinc-300" aria-hidden="true" />
            <span>Daily Timeline</span>
            <div className="flex items-center ml-3 gap-1">
              <button onClick={() => setViewDate(addDays(viewDate, -1))} className="p-1.5 hover:bg-zinc-900 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors">
                <ChevronLeftIcon className="size-3.5" />
              </button>
              <span className="text-xs font-medium font-sans text-zinc-400 min-w-[80px] text-center select-none">
                {isViewingToday ? 'Today' : format(viewDate, 'MMM d')}
              </span>
              <button onClick={() => setViewDate(addDays(viewDate, 1))} className="p-1.5 hover:bg-zinc-900 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors">
                <ChevronRightIcon className="size-3.5" />
              </button>
            </div>
          </h1>
          <p className="text-sm text-zinc-400 mt-1.5 leading-normal font-sans">
            Clean 1-hour time slices with customizable start times and sub-intervals inside any hour block.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFull24Hours(!showFull24Hours)}
            className="h-10 px-3.5 text-sm font-medium gap-2 rounded-xl bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100 transition-all"
          >
            {showFull24Hours ? <SunIcon className="size-4 text-zinc-400" /> : <MoonIcon className="size-4 text-zinc-400" />}
            <span>{showFull24Hours ? '6 AM – 11 PM' : '24h View'}</span>
          </Button>

          {onOpenAiWithPrompt && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                const summary = dayTasks.map(t => `${t.time || '09:00 AM'}: ${t.title}`).join('\n');
                onOpenAiWithPrompt(`As my Startup Founder AI Copilot, evaluate my schedule for ${selectedDay}. Identify context-switching waste or fragmented time blocks:\n\n${summary}`);
              }}
              className="h-10 px-4 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold text-sm rounded-xl inline-flex items-center gap-2 shadow-xs transition-all duration-200"
            >
              <SparklesIcon className="size-4 text-zinc-950" />
              <span>AI Optimize Schedule</span>
            </Button>
          )}
        </div>
      </div>

      {/* Weekday Selector Bar */}
      <Card className="bg-zinc-900/40 border-zinc-800 p-2 rounded-2xl shadow-xs font-sans overflow-x-auto mt-4">
        <div className="flex items-center justify-between min-w-[580px] gap-1.5">
          {(() => {
            const weekStart = startOfWeek(viewDate, { weekStartsOn: 1 });
            const scheduleDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

            return scheduleDates.map((dayDate) => {
              const dayStr = format(dayDate, 'yyyy-MM-dd');
              const dayShort = format(dayDate, 'EEE') as WeekDay;
              
              const count = tasks.filter(t => {
                return getEffectiveDate(t) === dayStr && (t.status === 'todo' || t.status === 'in_progress');
              }).length;
              
              const isActive = isSameDay(viewDate, dayDate);
              const isActualToday = isToday(dayDate);

              return (
                <button
                  key={dayStr}
                  type="button"
                  onClick={() => {
                    setViewDate(dayDate);
                    setCreatingForHour(null);
                  }}
                  className={cn(
                    'flex-1 py-2 px-3.5 rounded-xl text-sm font-medium transition-all flex flex-col items-center justify-center gap-0 select-none font-sans whitespace-nowrap',
                    isActive 
                      ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm' 
                      : isActualToday 
                      ? 'border border-zinc-700 text-zinc-200 font-semibold bg-zinc-900/80' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  )}
                >
                  <span className="flex items-center gap-1.5 leading-tight">
                    {dayShort}
                    {isActualToday && (
                      <span className={cn("text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded shadow-sm leading-none", isActive ? "bg-zinc-950 text-white" : "bg-indigo-500 text-white")}>
                        Today
                      </span>
                    )}
                    {count > 0 && (
                      <span className={cn(
                        "text-[10px] py-0.5 px-1.5 rounded-full font-mono font-bold leading-none",
                        isActive ? "bg-zinc-950/10 text-zinc-900" : "bg-zinc-800 text-zinc-300"
                      )}>
                        {count}
                      </span>
                    )}
                  </span>
                  <span className={cn("text-[10px] font-mono", isActive ? "text-zinc-600" : "text-zinc-500")}>
                    {format(dayDate, 'MMM d')}
                  </span>
                </button>
              );
            });
          })()}
        </div>
      </Card>

      {/* Timeline Feed (Smooth rounded-2xl Container & rounded-xl internal task cards) */}
      <Card className="bg-zinc-900/30 border-zinc-800/80 rounded-2xl shadow-xs font-sans overflow-hidden divide-y divide-zinc-800/60">
        {displayedHours.map((hourObj) => {
          const isCurrentHour = isViewingToday && hourObj.hour === currentHour;
          const hourTasks = getTasksForHour(hourObj.hour);
          const isCreating = creatingForHour === hourObj.hour;

          return (
            <div 
              key={hourObj.hour} 
              className={cn(
                'transition-colors relative flex flex-col md:flex-row md:items-start min-h-[48px] group',
                isCurrentHour ? 'bg-zinc-900/60 border-l-[3px] border-l-zinc-100' : 'border-l-[3px] border-l-transparent hover:bg-zinc-900/20',
                dragOverHour === hourObj.hour && 'bg-zinc-800/50 outline-dashed outline-2 outline-indigo-500/50'
              )}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverHour(hourObj.hour); }}
              onDragLeave={() => setDragOverHour(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverHour(null);
                try {
                  const taskId = e.dataTransfer.getData('taskId');
                  if (taskId) {
                    const newTime = `${String(hourObj.hour % 12 || 12).padStart(2, '0')}:00 ${hourObj.hour >= 12 ? 'PM' : 'AM'}`;
                    onUpdateTask(taskId, { time: newTime });
                  }
                } catch (err) {}
              }}
            >
              {/* Left Stamp (Standard 14px font-mono stamp) */}
              <div className="w-full md:w-32 shrink-0 py-2 px-4 flex items-center justify-between md:flex-col md:items-start md:justify-start gap-1.5 border-b md:border-b-0 border-zinc-800/40 select-none">
                <span className={cn(
                  'text-sm font-mono font-bold tracking-tight tabular-nums',
                  isCurrentHour ? 'text-zinc-100 font-extrabold' : 'text-zinc-400'
                )}>
                  {hourObj.label}
                </span>

                {isCurrentHour ? (
                  <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    Active Now
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartCreating(hourObj.hour, hourObj.label)}
                    title="Add custom time slot inside this hour"
                    className="opacity-0 group-hover:opacity-100 md:opacity-0 transition-opacity text-xs font-mono text-zinc-500 hover:text-zinc-200 inline-flex items-center gap-1 pt-1"
                  >
                    <PlusIcon className="size-3.5" />
                    <span>Slice</span>
                  </button>
                )}
              </div>

              {/* Hour Content Stream */}
              <div className="flex-1 py-2 px-4 md:border-l md:border-zinc-800/60 space-y-2.5 min-w-0">
                {/* Empty State / Schedule Prompt */}
                {hourTasks.length === 0 && !isCreating && (
                  <button
                    type="button"
                    onClick={() => handleStartCreating(hourObj.hour, hourObj.label)}
                    className="py-1.5 text-zinc-500 hover:text-zinc-300 text-sm font-sans italic flex items-center gap-2 cursor-pointer transition-colors w-full text-left"
                  >
                    <PlusIcon className="size-4 text-zinc-500" />
                    <span>Schedule objective or custom slice at {hourObj.label}...</span>
                  </button>
                )}

                {/* Inline Custom Slice Creator (Smooth rounded-xl container) */}
                {isCreating && (
                  <form onSubmit={(e) => handleCreateCustomSlice(e, hourObj.hour)} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 shadow-sm space-y-3 font-sans">
                    <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                      <span className="font-semibold text-zinc-200">Custom Time Slot Configuration</span>
                      <span className="text-zinc-500">Target: {hourObj.label}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                      <div>
                        <label className="text-xs font-medium text-zinc-400 block mb-1">Time Slice</label>
                        <TimePicker
                          value={customTimeInput}
                          onChange={(newTime) => setCustomTimeInput(newTime)}
                        />
                      </div>

                      <div className="flex-1 w-full">
                        <label className="text-xs font-medium text-zinc-400 block mb-1">Action Item</label>
                        <Input
                          autoFocus
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="What needs to be accomplished in this time slice? (Press Enter)"
                          className="h-9 text-xs bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 rounded-lg focus-visible:ring-1 focus-visible:ring-zinc-700 shadow-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setCreatingForHour(null)} className="h-8 px-3 text-xs font-medium text-zinc-400 hover:text-zinc-200 rounded-lg">
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" disabled={!newTitle.trim()} className="h-8 px-4 text-xs font-semibold bg-zinc-100 text-zinc-950 hover:bg-zinc-200 rounded-lg shadow-xs">
                        Add to Timeline
                      </Button>
                    </div>
                  </form>
                )}

                {/* Stack of Scheduled Tasks in this Hour (Smooth rounded-xl cards with standard 14px font) */}
                {hourTasks.map((task) => {
                  const isCompleted = task.status === 'completed';
                  const isFailed = task.status === 'failed';
                  const isHalfCompleted = task.status === 'half_completed';
                  const isExpanded = expandedTaskId === task.id;

                  return (
                    <Card 
                      key={task.id} 
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('taskId', task.id);
                      }}
                      className={cn(
                        'bg-zinc-950/90 border transition-all duration-200 p-2.5 rounded-lg shadow-xs font-sans hover:shadow-sm cursor-grab active:cursor-grabbing', 
                        isCompleted ? 'border-zinc-900 opacity-60' : isFailed ? 'border-rose-900/50 opacity-60' : isHalfCompleted ? 'border-yellow-900/50' : 'border-zinc-800 hover:border-zinc-700'
                      )}
                    >
                      <div onClick={() => setExpandedTaskId(isExpanded ? null : task.id)} className="flex items-center justify-between gap-3.5 cursor-pointer select-none">
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateTask(task.id, { status: isCompleted ? 'todo' : 'completed' });
                            }}
                            className="shrink-0 text-zinc-500 hover:text-zinc-200 transition-colors focus:outline-none"
                          >
                            {isCompleted ? <CheckCircle2Icon className="size-5 text-emerald-500" /> : isFailed ? <XCircleIcon className="size-5 text-rose-500" /> : isHalfCompleted ? <MinusCircleIcon className="size-5 text-yellow-500" /> : <CircleIcon className="size-5 text-zinc-500 hover:text-zinc-300" />}
                          </button>

                          <div className="min-w-0 flex-1 flex items-center gap-2.5 flex-wrap" onClick={(e) => {
                            if (editingTaskId === task.id) e.stopPropagation();
                          }}>
                            {editingTaskId === task.id ? (
                              <input
                                autoFocus
                                draggable={true}
                                onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
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
                                className="h-8 w-full px-2 text-sm font-semibold rounded-md bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                              />
                            ) : (
                              <span className={cn('text-sm font-semibold truncate tracking-tight', isCompleted ? 'line-through text-zinc-500 font-normal' : isFailed ? 'line-through text-rose-500/70 font-normal' : isHalfCompleted ? 'text-yellow-100/90' : 'text-zinc-100')}>
                                {task.title}
                              </span>
                            )}

                            {task.time && (
                              <Badge variant="outline" className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-900 border-zinc-800 text-indigo-300">
                                {task.time}
                              </Badge>
                            )}
                            
                            {editingTaskId !== task.id && (
                              <button
                                type="button"
                                title="Edit task title"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditTitleBuffer(task.title);
                                  setEditingTaskId(task.id);
                                }}
                                className="text-zinc-500 hover:text-zinc-200 p-1 rounded-md transition-colors ml-1"
                              >
                                <Edit2Icon className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          {task.attachments && task.attachments.length > 0 && (
                            <Badge variant="outline" className="text-xs font-mono rounded-md bg-zinc-900 border-zinc-800 text-zinc-400 gap-1 px-2 py-0.5">
                              <PaperclipIcon className="size-3 text-zinc-400" />
                              <span>{task.attachments.length}</span>
                            </Badge>
                          )}

                          <Badge variant="outline" className="text-xs font-sans font-medium rounded-md bg-zinc-900 border-zinc-800 text-zinc-300 px-2.5 py-0.5">
                            {task.category}
                          </Badge>

                          <button
                            type="button"
                            title="Mark as half completed"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateTask(task.id, { status: isHalfCompleted ? 'todo' : 'half_completed' });
                            }}
                            className={cn("p-1 rounded-md transition-colors", isHalfCompleted ? "text-yellow-500 hover:text-yellow-400" : "text-zinc-500 hover:text-yellow-400")}
                          >
                            <MinusCircleIcon className="size-4" />
                          </button>

                          <button
                            type="button"
                            title="Mark as not completed"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateTask(task.id, { status: isFailed ? 'todo' : 'failed' });
                            }}
                            className={cn("p-1 rounded-md transition-colors", isFailed ? "text-rose-500 hover:text-rose-400" : "text-zinc-500 hover:text-rose-400")}
                          >
                            <XIcon className="size-4" />
                          </button>

                          <button
                            type="button"
                            title="Delete task"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTask(task.id);
                            }}
                            className="text-zinc-500 hover:text-rose-400 p-1 rounded-md transition-colors"
                          >
                            <Trash2Icon className="size-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-3.5 border-t border-zinc-800/80 space-y-3.5 font-sans" onClick={(e) => e.stopPropagation()}>
                          <div className="space-y-1.5">
                            <label className="text-xs font-mono text-zinc-400 block font-medium">Execution Specs & Notes</label>
                            <textarea
                              rows={3}
                              draggable={true}
                              onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              value={task.description || ''}
                              onChange={(e) => onUpdateTask(task.id, { description: e.target.value })}
                              placeholder="Add specific action criteria or notes for this block..."
                              className="w-full text-sm p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-700 resize-y leading-relaxed"
                            />
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs text-zinc-400 font-medium">Edit Slice Time:</span>
                              <TimePicker
                                value={task.time || hourObj.label}
                                onChange={(newTime) => onUpdateTask(task.id, { time: newTime })}
                              />
                            </div>
                          </div>

                          <div className="pt-2 border-t border-zinc-800/60">
                            <MediaAttachments
                              attachments={task.attachments || []}
                              onAddAttachment={(newAtt) => {
                                const created = { ...newAtt, id: 'att-' + Date.now(), createdAt: new Date().toISOString() };
                                onUpdateTask(task.id, { attachments: [...(task.attachments || []), created] });
                              }}
                              onRemoveAttachment={(attId) => {
                                onUpdateTask(task.id, { attachments: (task.attachments || []).filter(a => a.id !== attId) });
                              }}
                              compact={true}
                            />
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}

                {/* Provide an easy link when an hour already has items */}
                {hourTasks.length > 0 && !isCreating && (
                  <button
                    type="button"
                    onClick={() => handleStartCreating(hourObj.hour, hourObj.label)}
                    className="py-1 text-xs font-mono text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-1.5 pl-1 transition-colors"
                  >
                    <PlusIcon className="size-3.5 text-zinc-500" />
                    <span>Add another task or slice to {hourObj.label}...</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
};

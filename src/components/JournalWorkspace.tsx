import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  SparklesIcon, 
  SmileIcon,
  TrendingUpIcon, 
  CalendarIcon,
  Trash2Icon,
  BookOpenIcon,
  PenLineIcon,
  SaveIcon,
  CheckCircle2Icon,
  TargetIcon,
  SparklesIcon as SparklesLucide,
  ZapIcon,
  SmileIcon as SmileLucide,
  CoffeeIcon,
  TrophyIcon,
  PinIcon,
  ChevronLeftIcon
} from 'lucide-react';
import { startOfWeek, addDays, isSameDay, format } from 'date-fns';
import { DiaryEntry, Mood, Attachment } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { MediaAttachments } from './MediaAttachments';
import { JournalEditor } from './JournalEditor';
import { cn } from '@/lib/utils';

interface JournalWorkspaceProps {
  entries: DiaryEntry[];
  onAddEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => void;
  onUpdateEntry: (id: string, updates: Partial<DiaryEntry>) => void;
  onDeleteEntry: (id: string) => void;
  onOpenAiWithPrompt?: (prompt: string) => void;
}

const moodColors: Record<string, string> = {
  focused: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  inspired: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  stressed: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  neutral: 'bg-zinc-800 text-zinc-300 border-zinc-700/60',
  fatigued: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  accomplished: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  calm: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  productive: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  excited: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  thoughtful: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  energetic: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
};

const moodIcons: Record<string, React.ReactNode> = {
  focused: <TargetIcon className="size-3.5 inline-block mr-1.5" />,
  inspired: <SparklesLucide className="size-3.5 inline-block mr-1.5" />,
  stressed: <ZapIcon className="size-3.5 inline-block mr-1.5" />,
  neutral: <SmileLucide className="size-3.5 inline-block mr-1.5" />,
  fatigued: <CoffeeIcon className="size-3.5 inline-block mr-1.5" />,
  accomplished: <TrophyIcon className="size-3.5 inline-block mr-1.5" />,
  calm: <SmileLucide className="size-3.5 inline-block mr-1.5" />,
  productive: <TargetIcon className="size-3.5 inline-block mr-1.5" />,
  excited: <SparklesLucide className="size-3.5 inline-block mr-1.5" />,
  thoughtful: <SmileLucide className="size-3.5 inline-block mr-1.5" />,
  energetic: <ZapIcon className="size-3.5 inline-block mr-1.5" />,
};

const moodLabels: Record<string, string> = {
  focused: 'Focused',
  inspired: 'Inspired',
  stressed: 'Stressed',
  neutral: 'Neutral',
  fatigued: 'Fatigued',
  accomplished: 'Accomplished',
  calm: 'Calm',
  productive: 'Productive',
  excited: 'Excited',
  thoughtful: 'Thoughtful',
  energetic: 'Energetic',
};

export const JournalWorkspace: React.FC<JournalWorkspaceProps> = ({
  entries,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onOpenAiWithPrompt,
}) => {
  // Helper to parse YYYY-MM-DD locally without UTC shift
  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    if (dateStr.includes('T')) return new Date(dateStr);
    const [y, m, d] = dateStr.split('-');
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  };

  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(entries[0]?.id || null);
  
  // Workspace controlled states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood>('focused');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSaved, setIsSaved] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [explicitWeekDate, setExplicitWeekDate] = useState<Date | null>(null);

  const currentEntry = entries.find(e => e.id === selectedEntryId);

  // Auto-select newly created entries
  const [previousEntriesLength, setPreviousEntriesLength] = useState(entries.length);
  useEffect(() => {
    if (entries.length > previousEntriesLength) {
      const newestEntry = [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      if (newestEntry) {
        setSelectedEntryId(newestEntry.id);
        setExplicitWeekDate(null);
      }
    }
    setPreviousEntriesLength(entries.length);
  }, [entries, previousEntriesLength]);

  // Sync workspace when selected entry switches
  useEffect(() => {
    if (currentEntry) {
      setTitle(currentEntry.title);
      setContent(currentEntry.content);
      setMood(currentEntry.mood);
      setAttachments(currentEntry.attachments || []);
      setIsSaved(true);
      setExplicitWeekDate(null); // Clear explicit date when an entry is active
    } else {
      setTitle('');
      setContent('');
      setMood('focused');
      setAttachments([]);
      setIsSaved(true);
    }
  }, [selectedEntryId, entries]);

  const handleCreateNew = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const existingEntry = entries.find(e => {
      const eDate = e.date || format(parseLocalDate(e.createdAt), 'yyyy-MM-dd');
      return eDate.startsWith(todayStr);
    });
    
    if (existingEntry) {
      setSelectedEntryId(existingEntry.id);
      return;
    }

    const defaultTitle = `Journal - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    const created = {
      title: defaultTitle,
      content: '',
      mood: 'focused' as Mood,
      date: format(new Date(), 'yyyy-MM-dd'),
      attachments: [],
    };
    onAddEntry(created);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setIsSaved(false);
    if (selectedEntryId) {
      onUpdateEntry(selectedEntryId, { title: val });
      setIsSaved(true);
    }
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    setIsSaved(false);
    if (selectedEntryId) {
      onUpdateEntry(selectedEntryId, { content: val });
      setIsSaved(true);
    }
  };

  const handleMoodChange = (val: Mood) => {
    setMood(val);
    if (selectedEntryId) {
      onUpdateEntry(selectedEntryId, { mood: val });
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const currentRefDate = explicitWeekDate || (currentEntry?.date ? parseLocalDate(currentEntry.date) : new Date());
  const weekStart = startOfWeek(currentRefDate, { weekStartsOn: 0 }); // Sunday
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  
  // Pinned entries appear strictly in the Pinned Logs section
  const pinnedEntries = entries.filter(e => e.isPinned);

  const renderEntryCard = (entry: DiaryEntry, dayDate?: Date) => {
    const isSelected = entry.id === selectedEntryId;
    const isToday = dayDate ? isSameDay(dayDate, new Date()) : false;
    
    return (
      <div
        key={entry.id + (dayDate ? '-day' : '-pin')}
        onClick={() => setSelectedEntryId(entry.id)}
        className={cn(
          'group relative flex flex-col gap-1.5 p-3 rounded-2xl cursor-pointer transition-all duration-200 border',
          isSelected
            ? 'bg-zinc-900/80 text-zinc-100 border-zinc-700 shadow-md ring-1 ring-zinc-700/50'
            : 'bg-zinc-950 text-zinc-400 border-zinc-900/80 hover:bg-zinc-900/40 hover:text-zinc-200 hover:border-zinc-800'
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500">
            {dayDate ? format(dayDate, 'EEE, MMM d, yyyy') : format(parseLocalDate(entry.date || entry.createdAt), 'EEE, MMM d, yyyy')}
          </span>
          <div className="flex items-center gap-1.5">
            {isToday && (
              <span className="text-[9px] font-mono uppercase bg-zinc-100 text-zinc-950 px-1.5 py-0.5 rounded-full font-bold">
                Today
              </span>
            )}
            {entry.isPinned && (
              <PinIcon className="size-3 text-amber-400" />
            )}
            <div className={cn(
              "flex items-center gap-0.5 transition-opacity bg-zinc-900/50 backdrop-blur-sm rounded-lg border border-zinc-800/80",
              isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              <button
                type="button"
                title={entry.isPinned ? "Unpin" : "Pin to sidebar"}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateEntry(entry.id, { isPinned: !entry.isPinned });
                }}
                className={cn("p-1 rounded-md transition-colors", entry.isPinned ? "text-amber-400 hover:text-amber-300" : "text-zinc-500 hover:text-zinc-300")}
              >
                <PinIcon className="size-3" />
              </button>
              <button
                type="button"
                title="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteEntry(entry.id);
                  if (isSelected && entries.length > 1) {
                    const remaining = entries.filter(item => item.id !== entry.id);
                    setSelectedEntryId(remaining[0]?.id || null);
                  }
                }}
                className="p-1 rounded-md text-zinc-500 hover:text-red-400 transition-colors"
              >
                <Trash2Icon className="size-3" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-start justify-between gap-2 mt-0.5">
          <h4 className="text-sm font-medium truncate tracking-tight text-zinc-100">
            {entry.title || 'Untitled'}
          </h4>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-mono mt-1">
          <span className={cn('flex items-center px-1.5 py-0.5 rounded-md font-medium text-[10px]', moodColors[entry.mood || 'focused']?.split(' ')[0], moodColors[entry.mood || 'focused']?.split(' ')[1])}>
            {moodLabels[entry.mood || 'focused']}
          </span>
        </div>
      </div>
    );
  };

  const isEntryEmpty = (entry: DiaryEntry) => {
    if (entry.attachments && entry.attachments.length > 0) return false;
    // Strip HTML tags to check if Tiptap content is genuinely empty
    const stripped = entry.content.replace(/<[^>]*>?/gm, '').trim();
    return stripped === '';
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-zinc-950 font-sans overflow-hidden relative">
      {/* Sidebar Toggle Button (when closed) */}
      {!isSidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-50 bg-zinc-950/80 backdrop-blur-md border border-zinc-900 shadow-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg"
        >
          <BookOpenIcon className="size-4" />
        </Button>
      )}

      {/* Left Sidebar: Weekly Navigator */}
      {isSidebarOpen && (
      <div className="w-full md:w-72 shrink-0 border-r border-zinc-900 bg-zinc-950 flex flex-col transition-all duration-300">
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between sticky top-0 bg-zinc-950/80 backdrop-blur-md z-10 border-b border-zinc-900/50">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-300">Journal Week</span>
            <span className="text-xs text-zinc-500 font-mono">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger 
                className="inline-flex items-center justify-center whitespace-nowrap outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 size-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition-colors"
              >
                <CalendarIcon className="size-4" />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-zinc-700 bg-zinc-900 rounded-xl shadow-xl" align="end">
                <Calendar
                  modifiers={{
                    range_start: [weekStart],
                    range_end: [addDays(weekStart, 6)],
                    range_middle: Array.from({ length: 5 }).map((_, i) => addDays(weekStart, i + 1))
                  }}
                  onDayClick={(day: Date) => {
                    if (day) {
                      // Format to local yyyy-MM-dd to avoid timezone shifts from toISOString
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const existingEntry = entries.find(e => e.date?.startsWith(dateStr) || e.createdAt.startsWith(dateStr));
                      if (existingEntry) {
                        setSelectedEntryId(existingEntry.id);
                      } else {
                        // Just navigate the calendar to this week
                        setExplicitWeekDate(day);
                        setSelectedEntryId(null);
                      }
                    }
                  }}
                  captionLayout="dropdown"
                  className="text-zinc-100 bg-zinc-900 rounded-xl"
                />
              </PopoverContent>
            </Popover>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(false)}
              className="size-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg ml-1"
              title="Close Sidebar"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
          </div>
        </div>

        {/* Weekly Days List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1.5 pt-3 pb-4">
          {pinnedEntries.length > 0 && (
            <div className="mb-6 space-y-2">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1 font-mono flex items-center gap-1.5">
                <PinIcon className="size-3" />
                <span>Pinned Logs</span>
              </h4>
              {pinnedEntries.map(entry => renderEntryCard(entry))}
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1 font-mono">
              This Week
            </h4>
            {weekDays.map((dayDate) => {
              const dateStr = format(dayDate, 'yyyy-MM-dd');
              const dayEntries = entries.filter(e => {
                const eDate = e.date || format(parseLocalDate(e.createdAt), 'yyyy-MM-dd');
                return eDate.startsWith(dateStr);
              });
              const isToday = isSameDay(dayDate, new Date());

              if (dayEntries.length > 0) {
                return (
                  <div key={dayDate.toISOString()} className="space-y-1.5">
                    {dayEntries.map(entry => renderEntryCard(entry, dayDate))}
                  </div>
                );
              }

            // Empty State for the day
            return (
              <div
                key={dayDate.toISOString()}
                onClick={() => {
                  const newEntry = {
                    title: `Journal - ${format(dayDate, 'MMM d, yyyy')}`,
                    content: '',
                    mood: 'neutral' as Mood,
                    date: format(dayDate, 'yyyy-MM-dd'),
                    attachments: [],
                  };
                  onAddEntry(newEntry);
                }}
                className="group flex flex-col gap-1 p-3 rounded-2xl cursor-pointer transition-all duration-200 border border-dashed border-zinc-800 bg-zinc-950/30 hover:bg-zinc-900/30 hover:border-zinc-700"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-600">
                    {format(dayDate, 'EEE, MMM d, yyyy')}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-mono uppercase bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded-full font-bold">
                      Today
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-medium text-zinc-600 italic">No entry yet</span>
                  <div className="size-5 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:bg-zinc-800 group-hover:text-zinc-300 transition-colors">
                    <PlusIcon className="size-3" />
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
      )}

      {/* Right Column: Main Canvas */}
      <div className="flex-1 flex flex-col relative bg-[#09090b]">
        {!currentEntry && entries.length > 0 ? (
          <div className="m-auto text-center p-12 space-y-4">
            <p className="text-zinc-500">Select an entry or start a new reflection.</p>
            <Button onClick={handleCreateNew} variant="outline" className="border-zinc-800 text-zinc-300">
              Create New
            </Button>
          </div>
        ) : !currentEntry && entries.length === 0 ? (
          <div className="m-auto text-center p-12 space-y-4">
            <p className="text-zinc-500">Your journal is empty.</p>
            <Button onClick={handleCreateNew} className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200">
              Start Writing
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col scroll-smooth">
            <div className="w-full max-w-[800px] mx-auto px-6 sm:px-12 pt-16 pb-32 flex flex-col flex-1">
              
              {/* Document Header (Notion-style) */}
              <div className="mb-8 group">
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Untitled"
                  className="text-4xl md:text-5xl font-semibold tracking-tight bg-transparent border-none px-0 h-auto rounded-none text-zinc-100 placeholder:text-zinc-800 focus-visible:ring-0 w-full mb-4 font-heading resize-none"
                />
                
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 opacity-70 group-hover:opacity-100 transition-opacity">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="size-3.5" />
                    {currentEntry?.date ? format(parseLocalDate(currentEntry.date), 'EEEE, MMMM d, yyyy') : 'Today'}
                  </span>
                  
                  <span className="text-zinc-700">|</span>
                  
                  <Select value={mood} onValueChange={(val) => handleMoodChange(val as Mood)}>
                    <SelectTrigger className="h-6 bg-transparent border-none p-0 text-xs text-zinc-400 hover:text-zinc-200 focus:ring-0 shadow-none w-auto gap-1">
                      {moodIcons[mood]}
                      <SelectValue placeholder="Mood" />
                    </SelectTrigger>
                    <SelectContent align="start" className="bg-zinc-950 border-zinc-800 text-zinc-200">
                      <SelectItem value="focused">Focused</SelectItem>
                      <SelectItem value="inspired">Inspired</SelectItem>
                      <SelectItem value="accomplished">Accomplished</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="stressed">Stressed</SelectItem>
                      <SelectItem value="fatigued">Fatigued</SelectItem>
                    </SelectContent>
                  </Select>

                  <span className="text-zinc-700">|</span>
                  
                  <span>{wordCount} words</span>
                </div>
              </div>

              {/* Tiptap Editor Canvas */}
              <div className="flex-1 min-h-[300px]">
                <JournalEditor 
                  content={content} 
                  onChange={handleContentChange} 
                />
              </div>

              {/* Attachments (Always Visible) */}
              <div className="mt-12 pt-8 border-t border-zinc-900/50">
                {attachments.length === 0 && (
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Media & Attachments</p>
                )}
                <MediaAttachments
                  attachments={attachments}
                  onAddAttachment={(newAtt) => {
                    const created = { ...newAtt, id: 'att-' + Date.now(), createdAt: new Date().toISOString() };
                    const updated = [...attachments, created];
                    setAttachments(updated);
                    if (selectedEntryId) onUpdateEntry(selectedEntryId, { attachments: updated });
                  }}
                  onRemoveAttachment={(attId) => {
                    const updated = attachments.filter(a => a.id !== attId);
                    setAttachments(updated);
                    if (selectedEntryId) onUpdateEntry(selectedEntryId, { attachments: updated });
                  }}
                  compact={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

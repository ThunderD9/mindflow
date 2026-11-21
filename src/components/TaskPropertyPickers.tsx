import React, { useState } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { TaskCategory, Priority } from '../types';
import { cn } from '@/lib/utils';
import { ChevronDownIcon, PlusIcon, CheckIcon, TagIcon, AlertCircleIcon } from 'lucide-react';

export const PRESET_CATEGORIES: TaskCategory[] = [
  'Work',
  'Personal',
  'Health',
  'Learning',
  'Ideas',
  'General',
];

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; dot: string }> = {
  urgent: {
    label: 'Urgent',
    color: 'text-rose-400 border-rose-500/30',
    bg: 'bg-rose-500/10 hover:bg-rose-500/20',
    dot: 'bg-rose-500',
  },
  high: {
    label: 'High',
    color: 'text-amber-400 border-amber-500/30',
    bg: 'bg-amber-500/10 hover:bg-amber-500/20',
    dot: 'bg-amber-500',
  },
  medium: {
    label: 'Mid',
    color: 'text-sky-400 border-sky-500/30',
    bg: 'bg-sky-500/10 hover:bg-sky-500/20',
    dot: 'bg-sky-500',
  },
  low: {
    label: 'Low',
    color: 'text-zinc-400 border-zinc-700/50',
    bg: 'bg-zinc-800/50 hover:bg-zinc-800',
    dot: 'bg-zinc-500',
  },
};

interface CategoryPickerProps {
  value: TaskCategory;
  onChange: (category: TaskCategory) => void;
  existingCategories?: string[];
  variant?: 'badge' | 'button';
  size?: 'xs' | 'sm';
  className?: string;
  disabled?: boolean;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  value,
  onChange,
  existingCategories = [],
  variant = 'badge',
  size = 'xs',
  className,
  disabled = false,
}) => {
  const [isCustomInputOpen, setIsCustomInputOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Combine presets with any unique custom categories
  const allCategories = Array.from(
    new Set([...PRESET_CATEGORIES, ...existingCategories.filter(Boolean)])
  );

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const trimmed = customValue.trim();
    if (trimmed) {
      onChange(trimmed);
      setCustomValue('');
      setIsCustomInputOpen(false);
      setIsOpen(false);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) setIsCustomInputOpen(false);
    }}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        {variant === 'badge' ? (
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'inline-flex items-center gap-1.5 font-medium transition-all rounded-md px-2 h-6 select-none focus:outline-none',
              size === 'xs' ? 'text-xs' : 'text-sm',
              'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 shadow-2xs',
              className
            )}
            title="Click to change category"
          >
            <TagIcon className="size-2.5 text-zinc-500" />
            <span className="truncate max-w-[120px]">{value || 'General'}</span>
            <ChevronDownIcon className="size-3 text-zinc-500 opacity-60" />
          </button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'h-8 px-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 gap-1.5 transition-colors shadow-2xs select-none',
              className
            )}
          >
            <TagIcon className="size-3 text-zinc-400" />
            <span className="truncate max-w-[100px]">{value || 'Category'}</span>
            <ChevronDownIcon className="size-3 text-zinc-500" />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-48 bg-zinc-950 border-zinc-800 text-zinc-200 p-1.5 z-50">
        <DropdownMenuLabel className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider px-2 py-1">
          Select Category
        </DropdownMenuLabel>

        <div className="max-h-56 overflow-y-auto space-y-0.5">
          {allCategories.map((cat) => {
            const isSelected = value === cat;
            return (
              <DropdownMenuItem
                key={cat}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(cat);
                  setIsOpen(false);
                }}
                className={cn(
                  'text-xs px-2.5 py-1.5 rounded-md cursor-pointer flex items-center justify-between transition-colors',
                  isSelected ? 'bg-zinc-800/80 text-white font-medium' : 'hover:bg-zinc-900 text-zinc-300'
                )}
              >
                <span>{cat}</span>
                {isSelected && <CheckIcon className="size-3.5 text-emerald-400" />}
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator className="bg-zinc-800 my-1" />

        {isCustomInputOpen ? (
          <form onSubmit={handleCustomSubmit} className="p-1 space-y-1.5" onClick={(e) => e.stopPropagation()}>
            <Input
              autoFocus
              placeholder="Custom category..."
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              className="h-7 text-xs bg-zinc-900 border-zinc-700 text-zinc-100 px-2 rounded-md"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setIsCustomInputOpen(false);
                }
              }}
            />
            <div className="flex items-center gap-1 justify-end pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCustomInputOpen(false)}
                className="h-6 px-2 text-[11px] text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!customValue.trim()}
                className="h-6 px-2.5 text-[11px] bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold rounded-md"
              >
                Add
              </Button>
            </div>
          </form>
        ) : (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsCustomInputOpen(true);
            }}
            className="text-xs px-2.5 py-1.5 rounded-md cursor-pointer text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/30 flex items-center gap-1.5"
          >
            <PlusIcon className="size-3.5" />
            <span>+ Custom Category...</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface PriorityPickerProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  variant?: 'badge' | 'button';
  size?: 'xs' | 'sm';
  className?: string;
  disabled?: boolean;
  collapseDot?: boolean;
  onToggleCollapse?: () => void;
}

export const PriorityPicker: React.FC<PriorityPickerProps> = ({
  value,
  onChange,
  variant = 'badge',
  size = 'xs',
  className,
  disabled = false,
  collapseDot,
  onToggleCollapse,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentConfig = PRIORITY_CONFIG[value] || PRIORITY_CONFIG.medium;
  const priorities: Priority[] = ['urgent', 'high', 'medium', 'low'];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        {variant === 'badge' ? (
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'inline-flex items-center font-medium transition-all rounded-md select-none focus:outline-none border shadow-2xs h-6',
              collapseDot ? 'gap-1 px-1.5 justify-center' : 'gap-1.5 px-2',
              size === 'xs' ? 'text-xs' : 'text-sm',
              currentConfig.color,
              currentConfig.bg,
              className
            )}
            title={`Priority: ${currentConfig.label}`}
          >
            <span className={cn(collapseDot ? 'size-2' : 'size-1.5', 'rounded-full shrink-0', currentConfig.dot)} />
            {!collapseDot && (
              <span>{currentConfig.label}</span>
            )}
            <ChevronDownIcon className="size-2.5 opacity-60 shrink-0" />
          </button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'h-8 px-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 gap-1.5 transition-colors shadow-2xs select-none',
              className
            )}
          >
            <span className={cn('size-2 rounded-full', currentConfig.dot)} />
            <span>{currentConfig.label}</span>
            <ChevronDownIcon className="size-3 text-zinc-500" />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-36 bg-zinc-950 border-zinc-800 text-zinc-200 p-1.5 z-50">
        <DropdownMenuLabel className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider px-2 py-1">
          Priority Level
        </DropdownMenuLabel>

        <div className="space-y-0.5">
          {priorities.map((p) => {
            const conf = PRIORITY_CONFIG[p];
            const isSelected = value === p;
            return (
              <DropdownMenuItem
                key={p}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(p);
                  setIsOpen(false);
                }}
                className={cn(
                  'text-xs px-2.5 py-1.5 rounded-md cursor-pointer flex items-center justify-between transition-colors',
                  isSelected ? 'bg-zinc-800/80 text-white font-medium' : 'hover:bg-zinc-900 text-zinc-300'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn('size-2 rounded-full', conf.dot)} />
                  <span>{conf.label}</span>
                </div>
                {isSelected && <CheckIcon className="size-3.5 text-emerald-400" />}
              </DropdownMenuItem>
            );
          })}
        </div>

        {onToggleCollapse && (
          <>
            <DropdownMenuSeparator className="bg-zinc-800 my-1" />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse();
                setIsOpen(false);
              }}
              className="text-xs px-2.5 py-1.5 rounded-md cursor-pointer flex items-center justify-between text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
            >
              <span>{collapseDot ? 'Show label' : 'Collapse to dot'}</span>
              <span className={cn('size-2 rounded-full', currentConfig.dot)} />
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

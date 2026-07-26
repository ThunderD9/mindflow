import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Task } from '../types';
import { startOfWeek, addDays, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getEffectiveDate = (t: Task) => {
  if (t.date) return t.date;
  if (!t.createdAt) return format(new Date(), 'yyyy-MM-dd');
  if (!t.scheduledDay) return format(new Date(t.createdAt), 'yyyy-MM-dd');
  const createdDate = new Date(t.createdAt);
  const weekStart = startOfWeek(createdDate, { weekStartsOn: 1 });
  const dayOrder: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  const offset = dayOrder[t.scheduledDay] || 0;
  return format(addDays(weekStart, offset), 'yyyy-MM-dd');
};

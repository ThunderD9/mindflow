import React from 'react';
import { ClockIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface TimePickerProps {
  value: string; // e.g. "09:00 AM" or "14:30" or "09:00"
  onChange: (timeStr: string) => void;
  className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  // Parse incoming value into hour (1-12), minute (00-59), ampm (AM/PM)
  const parseTime = (val: string) => {
    if (!val) return { hour: '09', minute: '00', ampm: 'AM' };
    const clean = val.trim();
    let ampm = clean.toUpperCase().includes('PM') ? 'PM' : 'AM';
    let rawTime = clean.replace(/(AM|PM)/i, '').trim();
    let [hStr, mStr] = rawTime.split(':');
    let h = parseInt(hStr || '9', 10);
    let m = parseInt(mStr || '0', 10);
    if (isNaN(h)) h = 9;
    if (isNaN(m)) m = 0;

    if (h >= 12 && ampm === 'AM') {
      if (h > 12) h = h - 12;
      ampm = 'PM';
    } else if (h === 0) {
      h = 12;
      ampm = 'AM';
    } else if (h > 12) {
      h = h - 12;
    }

    const hourFormatted = String(h).padStart(2, '0');
    const minuteFormatted = String(Math.floor(m / 5) * 5).padStart(2, '0');
    return { hour: hourFormatted, minute: minuteFormatted, ampm };
  };

  const { hour, minute, ampm } = parseTime(value);

  const handleHourChange = (newHour: string) => {
    onChange(`${newHour}:${minute} ${ampm}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    onChange(`${hour}:${newMinute} ${ampm}`);
  };

  const handleAmpmChange = (newAmpm: string) => {
    onChange(`${hour}:${minute} ${newAmpm}`);
  };

  const hoursList = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  return (
    <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg p-1 shadow-xs">
      <ClockIcon className="size-3.5 text-zinc-400 ml-1.5 shrink-0" />
      
      {/* Hour Select */}
      <Select value={hour} onValueChange={handleHourChange}>
        <SelectTrigger className="h-7 border-none bg-transparent hover:bg-zinc-800 text-xs font-semibold text-zinc-200 px-1.5 focus:ring-0 shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start" className="min-w-20">
          {hoursList.map(h => (
            <SelectItem key={h} value={h}>{h}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-xs text-zinc-500 font-bold">:</span>

      {/* Minute Select */}
      <Select value={minute} onValueChange={handleMinuteChange}>
        <SelectTrigger className="h-7 border-none bg-transparent hover:bg-zinc-800 text-xs font-semibold text-zinc-200 px-1.5 focus:ring-0 shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start" className="min-w-20">
          {minutesList.map(m => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* AM / PM Select */}
      <Select value={ampm} onValueChange={handleAmpmChange}>
        <SelectTrigger className="h-7 border-none bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-indigo-300 px-2 focus:ring-0 shadow-none rounded-md">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end" className="min-w-16">
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

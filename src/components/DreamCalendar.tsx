import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import type { Dream } from '../types';

interface DreamCalendarProps {
  dreams: Dream[];
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
}

const DreamCalendar = ({ dreams, onSelectDate, selectedDate }: DreamCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDreamCountForDate = (date: Date) => {
    return dreams.filter(dream => isSameDay(new Date(dream.date), date)).length;
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="dream-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-cinzel text-lg text-burgundy flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Dream Calendar
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-burgundy/20 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-cinzel">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-burgundy/20 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="text-center text-sm font-cinzel text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {monthDays.map(day => {
          const dreamCount = getDreamCountForDate(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);

          return (
            <motion.button
              key={day.toString()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectDate(day)}
              className={`
                relative p-3 rounded-lg transition-colors
                ${!isSameMonth(day, currentMonth) ? 'text-gray-600' : ''}
                ${isSelected ? 'bg-burgundy/20 text-burgundy' : 'hover:bg-burgundy/10'}
                ${isCurrentDay ? 'border border-burgundy/30' : ''}
              `}
            >
              <span className="relative z-10">{format(day, 'd')}</span>
              {dreamCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-burgundy"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default DreamCalendar;
import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Dream } from '../types';

interface DreamCalendarProps {
  dreams: Dream[];
  onDateSelect: (date: string) => void;
}

const DreamCalendar = ({ dreams, onDateSelect }: DreamCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    return { daysInMonth, startingDay };
  };

  const getDreamsForDate = (date: string) => {
    return dreams.filter(dream => dream.date === date);
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);

  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();
    const currentDate = formatDate(today);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateString = formatDate(date);
      const dayDreams = getDreamsForDate(dateString);
      const isToday = dateString === currentDate;
      const hasDreams = dayDreams.length > 0;

      days.push(
        <button
          key={day}
          onClick={() => onDateSelect(dateString)}
          className={`p-2 text-sm rounded-lg transition-colors ${
            isToday
              ? 'bg-burgundy text-white'
              : hasDreams
              ? 'bg-burgundy/20 text-burgundy hover:bg-burgundy/30'
              : 'hover:bg-mystic-800 text-gray-300'
          }`}
        >
          <div className="flex flex-col items-center">
            <span>{day}</span>
            {hasDreams && (
              <div className="flex gap-1 mt-1">
                {dayDreams.slice(0, 3).map((_, index) => (
                  <div
                    key={index}
                    className="w-1 h-1 bg-burgundy rounded-full"
                  />
                ))}
              </div>
            )}
          </div>
        </button>
      );
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="bg-mystic-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-mystic-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="font-cinzel text-lg">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-mystic-700 rounded-lg transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-xs text-gray-400 font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default DreamCalendar;
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Birthday } from '../types';

interface CalendarViewProps {
  birthdays: Birthday[];
  onEditBirthday: (bday: Birthday) => void;
}

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function CalendarView({ birthdays, onEditBirthday }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    
    // Calculate empty days before the first day of the month (Monday = 0)
    let firstDay = date.getDay() - 1;
    if (firstDay === -1) firstDay = 6; // Sunday
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDay; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getBirthdaysForDay = (day: number | null) => {
    if (!day) return [];
    const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const targetDate = `${monthStr}-${dayStr}`;
    return birthdays.filter(b => b.birth_date === targetDate);
  };

  return (
    <div className="calendar-view full-page-calendar card">
      <div className="calendar-header">
        <button onClick={prevMonth} className="btn-icon"><ChevronLeft size={20}/></button>
        <h3>{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
        <button onClick={nextMonth} className="btn-icon"><ChevronRight size={20}/></button>
      </div>
      
      <div className="calendar-grid">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="calendar-day-name">{day}</div>
        ))}
        
        {getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()).map((day, idx) => {
          const bdays = getBirthdaysForDay(day);
          const isToday = day && day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
          
          return (
            <div key={idx} className={`calendar-cell ${day ? '' : 'empty'} ${isToday ? 'today' : ''} ${bdays.length > 0 ? 'has-bday' : ''}`}>
              {day && <span className="day-number">{day}</span>}
              {day && bdays.length > 0 && (
                <div className="bday-pills">
                  {bdays.map(bday => (
                    <div key={bday.id} className="bday-pill" onClick={() => onEditBirthday(bday)} title="Editar">
                      {bday.image_url ? (
                        <img src={bday.image_url} alt={bday.name} className="pill-avatar" />
                      ) : (
                        <div className="pill-avatar text-avatar">{bday.name.charAt(0).toUpperCase()}</div>
                      )}
                      <span className="pill-name">{bday.nickname || bday.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

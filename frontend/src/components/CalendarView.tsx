import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { Birthday } from '../types';

interface CalendarViewProps {
  birthdays: Birthday[];
  onEditBirthday: (bday: Birthday) => void;
}

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function CalendarView({ birthdays, onEditBirthday }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    
    if (val.trim().length > 1) {
      const lower = val.toLowerCase();
      const match = birthdays.find(b => 
        b.name.toLowerCase().includes(lower) || 
        (b.nickname && b.nickname.toLowerCase().includes(lower))
      );
      if (match) {
        const [mStr] = match.birth_date.split('-');
        const mIdx = parseInt(mStr, 10) - 1;
        // Solo saltamos si es diferente al mes actual
        if (mIdx !== currentDate.getMonth()) {
          setCurrentDate(new Date(currentDate.getFullYear(), mIdx, 1));
        }
      }
    }
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
    let dayBirthdays = birthdays.filter(b => b.birth_date === targetDate);
    
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      dayBirthdays = dayBirthdays.filter(b => 
        b.name.toLowerCase().includes(lower) || 
        (b.nickname && b.nickname.toLowerCase().includes(lower))
      );
    }
    
    return dayBirthdays;
  };

  return (
    <div className="calendar-view full-page-calendar card">
      <div className="calendar-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={prevMonth} className="btn-icon"><ChevronLeft size={20}/></button>
          <h3>{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
          <button onClick={nextMonth} className="btn-icon"><ChevronRight size={20}/></button>
        </div>
        
        <div className="search-box" style={{ position: 'relative', minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Buscar amigo en calendario..." 
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
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

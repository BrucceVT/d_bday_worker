import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { Birthday, EventRecord } from '../types';

interface CalendarViewProps {
  birthdays: Birthday[];
  events: EventRecord[];
  onEditBirthday: (bday: Birthday) => void;
  onEditEvent: (ev: EventRecord) => void;
}

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function CalendarView({ birthdays, events, onEditBirthday, onEditEvent }: CalendarViewProps) {
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
      
      const matchBday = birthdays.find(b => 
        b.name.toLowerCase().includes(lower) || 
        (b.nickname && b.nickname.toLowerCase().includes(lower))
      );
      
      const matchEvent = events.find(e => e.title.toLowerCase().includes(lower));

      let mIdx = -1;

      if (matchBday) {
        const [mStr] = matchBday.birth_date.split('-');
        mIdx = parseInt(mStr, 10) - 1;
      } else if (matchEvent) {
        let dStr = matchEvent.event_date;
        if (dStr.length === 5) {
          const [mStr] = dStr.split('-');
          mIdx = parseInt(mStr, 10) - 1;
        } else {
          if (dStr.includes(' ')) dStr = dStr.split(' ')[0];
          if (dStr.includes('T')) dStr = dStr.split('T')[0];
          const parts = dStr.split('-');
          if (parts.length === 3) {
            mIdx = parseInt(parts[1], 10) - 1;
          }
        }
      }

      if (mIdx !== -1 && mIdx !== currentDate.getMonth()) {
        setCurrentDate(new Date(currentDate.getFullYear(), mIdx, 1));
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
    return birthdays.filter(b => b.birth_date === targetDate);
  };

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    
    const targetMMDD = `${monthStr}-${dayStr}`;
    const targetYYYYMMDD = `${currentDate.getFullYear()}-${monthStr}-${dayStr}`;

    return events.filter(e => {
      if (e.event_date.length === 5) {
        return e.event_date === targetMMDD;
      } else {
        return e.event_date.startsWith(targetYYYYMMDD);
      }
    });
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
          const evs = getEventsForDay(day);
          
          return (
            <div key={idx} className={`day-cell ${!day ? 'empty' : ''}`}>
              {day && <span className="day-number">{day}</span>}
              {day && (bdays.length > 0 || evs.length > 0) && (
                <div className="bday-pills">
                  {bdays.map(bday => {
                    const isHighlighted = searchTerm.trim().length > 1 && (
                      bday.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (bday.nickname && bday.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
                    );

                    return (
                      <div 
                        key={`bday-${bday.id}`} 
                        className={`bday-pill ${isHighlighted ? 'highlight-pulse' : ''}`}
                        onClick={(e) => { e.stopPropagation(); onEditBirthday(bday); }}
                        title={bday.custom_message || ''}
                        style={isHighlighted ? { transform: 'scale(1.05)', boxShadow: '0 0 10px var(--primary)', border: '2px solid var(--primary)', zIndex: 10 } : {}}
                      >
                        <span className="pill-dot"></span>
                        <span className="pill-name">{bday.nickname || bday.name.split(' ')[0]}</span>
                      </div>
                    );
                  })}

                  {evs.map(ev => {
                    const isHighlighted = searchTerm.trim().length > 1 && ev.title.toLowerCase().includes(searchTerm.toLowerCase());
                    const isPrivate = ev.type === 'private_event';

                    return (
                      <div 
                        key={`ev-${ev.id}`} 
                        className={`bday-pill ${isHighlighted ? 'highlight-pulse' : ''}`}
                        onClick={(e) => { e.stopPropagation(); onEditEvent(ev); }}
                        title={ev.description || ''}
                        style={{ 
                           background: isPrivate ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'linear-gradient(135deg, #10b981, #059669)',
                           ...(isHighlighted ? { transform: 'scale(1.05)', boxShadow: '0 0 10px var(--primary)', border: '2px solid var(--primary)', zIndex: 10 } : {})
                        }}
                      >
                        <span className="pill-dot" style={{ background: 'white' }}></span>
                        <span className="pill-name" style={{ color: 'white' }}>{ev.title}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

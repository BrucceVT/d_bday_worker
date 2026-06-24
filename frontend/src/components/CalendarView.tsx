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
  const [calendarMode, setCalendarMode] = useState<'month' | 'year'>('month');

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleSearchChange = (val: string) => {
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
      <div className="calendar-header" style={{ flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={prevMonth} className="btn-icon"><ChevronLeft size={20}/></button>
          <h3 style={{ margin: 0, width: '220px', textAlign: 'center' }}>{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
          <button onClick={nextMonth} className="btn-icon"><ChevronRight size={20}/></button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select 
            value={currentDate.getMonth()} 
            onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))}
            className="filter-select"
          >
            {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <input 
            type="number" 
            value={currentDate.getFullYear()} 
            onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}
            className="filter-number"
            style={{ width: '85px' }}
          />
        </div>
        
        <div className="search-box" style={{ position: 'relative', minWidth: '200px', flex: '1 1 auto' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Buscar persona o evento..." 
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{ paddingLeft: '2.5rem', width: '100%' }}
          />
        </div>

        <div className="toggle-view-container">
          <button className={`toggle-view-btn ${calendarMode === 'month' ? 'active' : ''}`} onClick={() => setCalendarMode('month')}>Mes</button>
          <button className={`toggle-view-btn ${calendarMode === 'year' ? 'active' : ''}`} onClick={() => setCalendarMode('year')}>Año</button>
        </div>
      </div>
      
      {calendarMode === 'year' ? (
        <div className="yearly-grid">
          {Array.from({ length: 12 }, (_, i) => i).map(month => {
            const daysInMonth = getDaysInMonth(currentDate.getFullYear(), month);
            return (
              <div 
                key={month} 
                className="mini-month"
                onClick={() => {
                  setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
                  setCalendarMode('month');
                }}
              >
                <h4>{MONTH_NAMES[month]}</h4>
                <div className="mini-grid">
                  {['L','M','X','J','V','S','D'].map(d => <div key={d} className="mini-day-name">{d}</div>)}
                  {daysInMonth.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} className="mini-cell empty"></div>;
                    
                    const monthStr = String(month + 1).padStart(2, '0');
                    const dayStr = String(day).padStart(2, '0');
                    const targetMMDD = `${monthStr}-${dayStr}`;
                    const targetYYYYMMDD = `${currentDate.getFullYear()}-${monthStr}-${dayStr}`;
                    
                    const hasBday = birthdays.some(b => b.birth_date === targetMMDD);
                    const ev = events.find(e => e.event_date === targetMMDD || e.event_date.startsWith(targetYYYYMMDD));
                    const isToday = day === new Date().getDate() && month === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                    
                    return (
                      <div key={idx} className={`mini-cell`} style={isToday ? { color: 'var(--primary)', fontWeight: 'bold' } : {}}>
                        {day}
                        {hasBday && <div className="event-dot" style={{ background: 'var(--secondary)' }}></div>}
                        {!hasBday && ev && <div className="event-dot" style={{ background: '#10b981' }}></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="calendar-grid">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="calendar-day-name">{day}</div>
          ))}
          
          {getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()).map((day, idx) => {
            const bdays = getBirthdaysForDay(day);
            const evs = getEventsForDay(day);
            
            let cellHasHighlight = false;
            
            const highlightedBdays = bdays.map(bday => {
              const isH = searchTerm.trim().length > 1 && (
                bday.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (bday.nickname && bday.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
              );
              if (isH) cellHasHighlight = true;
              return { ...bday, isHighlighted: isH };
            });

            const highlightedEvs = evs.map(ev => {
              const isH = searchTerm.trim().length > 1 && ev.title.toLowerCase().includes(searchTerm.toLowerCase());
              if (isH) cellHasHighlight = true;
              return { ...ev, isHighlighted: isH };
            });
            
            const isToday = day && day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
            
            return (
              <div 
                key={idx} 
                className={`calendar-cell ${!day ? 'empty' : ''} ${isToday ? 'today' : ''}`}
                style={cellHasHighlight ? { 
                  backgroundColor: 'rgba(139, 92, 246, 0.15)', 
                  borderColor: 'var(--primary)', 
                  boxShadow: 'inset 0 0 20px rgba(139, 92, 246, 0.2)' 
                } : {}}
              >
                {day && <span className="day-number" style={cellHasHighlight ? { color: 'var(--primary)', fontWeight: 'bold' } : {}}>{day}</span>}
                {day && (highlightedBdays.length > 0 || highlightedEvs.length > 0) && (
                  <div className="bday-pills">
                    {highlightedBdays.map(bday => (
                      <div 
                        key={`bday-${bday.id}`} 
                        className={`bday-pill ${bday.isHighlighted ? 'highlight-pulse' : ''}`}
                        onClick={(e) => { e.stopPropagation(); onEditBirthday(bday); }}
                        title={bday.custom_message || ''}
                        style={bday.isHighlighted ? { transform: 'scale(1.05)', boxShadow: '0 0 10px var(--primary)', border: '2px solid var(--primary)', zIndex: 10 } : {}}
                      >
                        <span className="pill-dot"></span>
                        <span className="pill-name">{bday.nickname || bday.name.split(' ')[0]}</span>
                      </div>
                    ))}

                    {highlightedEvs.map(ev => {
                      const isPrivate = ev.type === 'private_event';
                      return (
                        <div 
                          key={`ev-${ev.id}`} 
                          className={`bday-pill ${ev.isHighlighted ? 'highlight-pulse' : ''}`}
                          onClick={(e) => { e.stopPropagation(); onEditEvent(ev); }}
                          title={ev.description || ''}
                          style={{ 
                             background: isPrivate ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'linear-gradient(135deg, #10b981, #059669)',
                             ...(ev.isHighlighted ? { transform: 'scale(1.05)', boxShadow: '0 0 10px var(--primary)', border: '2px solid var(--primary)', zIndex: 10 } : {})
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
      )}
    </div>
  );
}

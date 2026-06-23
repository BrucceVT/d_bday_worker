import { useState, useMemo } from 'react';
import { Edit2, Trash2, CalendarHeart, Globe, Search, PlusCircle } from 'lucide-react';
import type { EventRecord } from '../types';

interface EventsViewProps {
  events: EventRecord[];
  onAddEvent: () => void;
  onEditEvent: (ev: EventRecord) => void;
  onDeleteEvent: (id: number) => void;
}

export function EventsView({ events, onAddEvent, onEditEvent, onDeleteEvent }: EventsViewProps) {
  const [activeTab, setActiveTab] = useState<'private' | 'holidays'>('private');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = useMemo(() => {
    let filtered = events;
    if (activeTab === 'private') {
      filtered = filtered.filter(e => e.type === 'private_event');
    } else {
      filtered = filtered.filter(e => e.type === 'holiday_global' || e.type === 'holiday_local');
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(e => e.title.toLowerCase().includes(lower));
    }
    
    return filtered;
  }, [events, activeTab, searchTerm]);

  const formatDate = (dateStr: string) => {
    if (dateStr.length === 5) {
      // MM-DD
      const [m, d] = dateStr.split('-');
      return `${d}/${m}`;
    }
    if (dateStr.includes(' ')) {
      // YYYY-MM-DD HH:MM
      const [datePart, timePart] = dateStr.split(' ');
      const [y, m, d] = datePart.split('-');
      return `${d}/${m}/${y} - ${timePart}`;
    }
    if (dateStr.includes('T')) {
      const [datePart, timePart] = dateStr.split('T');
      const [y, m, d] = datePart.split('-');
      return `${d}/${m}/${y} - ${timePart}`;
    }
    return dateStr;
  };

  return (
    <div className="list-view card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="list-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <CalendarHeart size={24} color="var(--primary)" /> 
          Eventos & Feriados
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '400px' }}>
          <div className="search-box" style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Buscar evento..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <button className="btn btn-primary" onClick={onAddEvent} style={{ width: 'auto', padding: '0.5rem 1rem' }}>
            <PlusCircle size={18} /> Nuevo Evento
          </button>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        background: 'rgba(0,0,0,0.2)', 
        borderRadius: '12px', 
        padding: '0.35rem', 
        marginBottom: '1.5rem',
        border: '1px solid var(--glass-border)'
      }}>
        <button 
          onClick={() => setActiveTab('private')}
          style={{ 
            flex: 1, 
            padding: '0.6rem', 
            fontWeight: 600, 
            background: activeTab === 'private' ? 'var(--primary)' : 'transparent', 
            border: 'none',
            borderRadius: '8px',
            color: activeTab === 'private' ? '#fff' : 'var(--text-muted)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
        >
          Salidas Privadas
        </button>
        <button 
          onClick={() => setActiveTab('holidays')}
          style={{ 
            flex: 1, 
            padding: '0.6rem', 
            fontWeight: 600, 
            background: activeTab === 'holidays' ? 'var(--primary)' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            color: activeTab === 'holidays' ? '#fff' : 'var(--text-muted)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <Globe size={18} /> Feriados
        </button>
      </div>
      
      {filteredEvents.length === 0 ? (
        <div className="loading" style={{ flex: 1 }}>
          <CalendarHeart size={48} color="rgba(255,255,255,0.1)" />
          <p>No se encontraron eventos en esta categoría.</p>
        </div>
      ) : (
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
          <ul className="birthday-list">
            {filteredEvents.map(ev => (
              <li key={ev.id} className="birthday-item">
                <div className="bday-info">
                  <div className="bday-avatar" style={{ background: ev.type === 'private_event' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'linear-gradient(135deg, #10b981, #059669)' }}>
                    {ev.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="bday-details">
                    <h3>{ev.title}</h3>
                    <p><CalendarHeart size={14} /> {formatDate(ev.event_date)}</p>
                    {ev.description && (
                      <p className="msg-preview">"{ev.description}"</p>
                    )}
                  </div>
                </div>
                <div className="bday-actions">
                  <button onClick={() => onEditEvent(ev)} className="btn-icon" title="Editar">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => onDeleteEvent(ev.id)} className="btn-icon danger" title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { X, CalendarHeart, AlignLeft, Type } from 'lucide-react';
import type { EventRecord, EventType } from '../types';

interface EventModalProps {
  event: EventRecord | null;
  onSave: (event: Omit<EventRecord, 'id'>) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export function EventModal({ event, onSave, onClose, isLoading }: EventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<EventType>('private_event');
  const [dateType, setDateType] = useState<'exact' | 'recurring'>('exact'); // exact (YYYY-MM-DD HH:MM), recurring (MM-DD)
  
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('01');
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setEventType(event.type);
      
      const isRecurring = event.type === 'holiday_global' || event.type === 'holiday_local' || event.event_date.length === 5;
      setDateType(isRecurring ? 'recurring' : 'exact');
      
      if (isRecurring) {
        const [m, d] = event.event_date.split('-');
        setMonth(m);
        setDay(d);
      } else {
        // YYYY-MM-DD HH:MM or YYYY-MM-DDTHH:MM
        let dPart = event.event_date;
        let tPart = '';
        if (event.event_date.includes(' ')) {
          [dPart, tPart] = event.event_date.split(' ');
        } else if (event.event_date.includes('T')) {
          [dPart, tPart] = event.event_date.split('T');
        }
        
        const parts = dPart.split('-');
        if (parts.length === 3) {
          setYear(parts[0]);
          setMonth(parts[1]);
          setDay(parts[2]);
        }
        if (tPart) {
          setTime(tPart);
        }
      }
    } else {
      setTitle('');
      setDescription('');
      setEventType('private_event');
      setDateType('exact');
      const now = new Date();
      setYear(now.getFullYear().toString());
      setMonth(String(now.getMonth() + 1).padStart(2, '0'));
      setDay(String(now.getDate()).padStart(2, '0'));
      setTime('');
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalDate = '';
    const dStr = day.padStart(2, '0');
    
    if (dateType === 'recurring') {
      finalDate = `${month}-${dStr}`;
    } else {
      const yStr = year || new Date().getFullYear().toString();
      finalDate = `${yStr}-${month}-${dStr}`;
      if (time) {
        finalDate += ` ${time}`;
      }
    }

    await onSave({
      title,
      description: description || null,
      type: eventType,
      event_date: finalDate
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3>{event ? 'Editar Evento' : 'Nuevo Evento'}</h3>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label><Type size={16}/> Título del Evento *</label>
            <input 
              type="text" 
              className="form-control" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Ej: Salida al cine, Navidad..."
              required 
            />
          </div>

          <div className="form-group">
            <label><AlignLeft size={16}/> Descripción (Opcional)</label>
            <textarea 
              className="form-control" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Ej: Vamos a ver Deadpool, nos encontramos en el mall."
              rows={2}
            />
          </div>
          
          <div className="form-group">
            <label>Tipo de Evento *</label>
            <select 
              className="form-control" 
              value={eventType} 
              onChange={e => {
                const val = e.target.value as EventType;
                setEventType(val);
                if (val !== 'private_event') {
                  setDateType('recurring');
                } else {
                  setDateType('exact');
                }
              }}
            >
              <option value="private_event">Salida Privada / Evento Único</option>
              <option value="holiday_local">Feriado Regional (Arequipa/Perú)</option>
              <option value="holiday_global">Feriado Global</option>
            </select>
          </div>

          <div className="form-group">
            <label><CalendarHeart size={16}/> Fecha del Evento *</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button 
                type="button"
                className={`btn ${dateType === 'exact' ? 'btn-primary' : ''}`}
                style={{ flex: 1, padding: '0.5rem', background: dateType === 'exact' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}
                onClick={() => setDateType('exact')}
              >
                Fecha Exacta
              </button>
              <button 
                type="button"
                className={`btn ${dateType === 'recurring' ? 'btn-primary' : ''}`}
                style={{ flex: 1, padding: '0.5rem', background: dateType === 'recurring' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}
                onClick={() => setDateType('recurring')}
              >
                Todos los años
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {dateType === 'exact' && (
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="Año" 
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  style={{ flex: 1, padding: '0.85rem 0.5rem', textAlign: 'center' }}
                />
              )}
              <select 
                className="form-control" 
                value={month} 
                onChange={e => setMonth(e.target.value)}
                style={{ flex: 2, padding: '0.85rem 0.5rem' }}
              >
                <option value="01">Enero</option>
                <option value="02">Febrero</option>
                <option value="03">Marzo</option>
                <option value="04">Abril</option>
                <option value="05">Mayo</option>
                <option value="06">Junio</option>
                <option value="07">Julio</option>
                <option value="08">Agosto</option>
                <option value="09">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </select>
              <input 
                type="number" 
                className="form-control" 
                min="1" 
                max="31" 
                value={day} 
                onChange={e => setDay(e.target.value)}
                placeholder="Día"
                style={{ flex: 1, padding: '0.85rem 0.5rem', textAlign: 'center' }}
                required
              />
            </div>
            
            {dateType === 'exact' && (
              <div style={{ marginTop: '0.5rem' }}>
                <input 
                  type="time" 
                  className="form-control" 
                  value={time} 
                  onChange={e => setTime(e.target.value)}
                  placeholder="HH:MM (Opcional)"
                />
                <small style={{ color: 'var(--text-muted)' }}>Hora (opcional) para alertar 1 hr antes.</small>
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button type="button" onClick={onClose} className="btn" style={{ background: 'rgba(255,255,255,0.1)', flex: 1 }}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ flex: 1 }}>
              {isLoading ? 'Guardando...' : 'Guardar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

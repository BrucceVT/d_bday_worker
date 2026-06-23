import { useState, useEffect } from 'react';
import { X, Calendar, Image as ImageIcon, MessageSquare, Cake } from 'lucide-react';
import type { Birthday } from '../types';

interface BirthdayModalProps {
  birthday?: Birthday; // Si existe, estamos en modo editar
  onClose: () => void;
  onSave: (data: Partial<Birthday>) => void;
}

const MONTHS = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
];

export function BirthdayModal({ birthday, onClose, onSave }: BirthdayModalProps) {
  const [name, setName] = useState(birthday?.name || '');
  const [nickname, setNickname] = useState(birthday?.nickname || '');
  const [month, setMonth] = useState(() => birthday?.birth_date.split('-')[0] || '01');
  const [day, setDay] = useState(() => birthday?.birth_date.split('-')[1] || '01');
  const [imageUrl, setImageUrl] = useState(birthday?.image_url || '');
  const [customMessage, setCustomMessage] = useState(birthday?.custom_message || '');

  // Calculamos los días que tiene el mes seleccionado (usamos 2024 para permitir 29 de feb)
  const getDaysInMonth = (m: string) => {
    return new Date(2024, parseInt(m, 10), 0).getDate();
  };

  const daysInMonth = getDaysInMonth(month);

  // Ajustar el día si el mes cambia y tiene menos días
  useEffect(() => {
    if (parseInt(day, 10) > daysInMonth) {
      setDay(String(daysInMonth).padStart(2, '0'));
    }
  }, [month, daysInMonth, day]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    onSave({
      id: birthday?.id,
      name,
      nickname: nickname || null,
      birth_date: `${month}-${day}`,
      image_url: imageUrl || null,
      custom_message: customMessage || null
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{birthday ? 'Editar Cumpleaños' : 'Nuevo Cumpleaños'}</h2>
          <button onClick={onClose} className="modal-close" type="button"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre de la persona</label>
            <input 
              type="text" 
              className="form-control" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Ej. Juan Pérez"
              required
            />
          </div>

          <div className="form-group">
            <label>Apodo / Nickname (Opcional)</label>
            <input 
              type="text" 
              className="form-control" 
              value={nickname} 
              onChange={e => setNickname(e.target.value)} 
              placeholder="Ej. El Juancho"
            />
          </div>
          
          <div className="form-group">
            <label><Calendar size={16} style={{display:'inline', marginBottom:'-3px'}}/> Fecha de Cumpleaños</label>
            <div className="date-selects">
              <select className="form-control date-select" value={day} onChange={e => setDay(e.target.value)}>
                {Array.from({length: daysInMonth}, (_, i) => i + 1).map(d => {
                  const dayStr = String(d).padStart(2, '0');
                  return <option key={d} value={dayStr}>{dayStr}</option>;
                })}
              </select>
              <span className="date-separator">de</span>
              <select className="form-control date-select" value={month} onChange={e => setMonth(e.target.value)}>
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label><ImageIcon size={16} style={{display:'inline', marginBottom:'-3px'}}/> URL de Imagen (Opcional)</label>
            <input 
              type="url" 
              className="form-control" 
              value={imageUrl} 
              onChange={e => setImageUrl(e.target.value)} 
              placeholder="https://ejemplo.com/foto.jpg"
            />
          </div>

          <div className="form-group">
            <label><MessageSquare size={16} style={{display:'inline', marginBottom:'-3px'}}/> Mensaje Personalizado (Opcional)</label>
            <textarea 
              className="form-control" 
              value={customMessage} 
              onChange={e => setCustomMessage(e.target.value)} 
              placeholder="Ej. 🎉 ¡Feliz cumpleaños, Juan! 🎂 Que la pases genial."
            />
          </div>

          <button type="submit" className="btn btn-primary">
            <Cake size={18} /> {birthday ? 'Actualizar Cambios' : 'Guardar Cumpleaños'}
          </button>
        </form>
      </div>
    </div>
  );
}

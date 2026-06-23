import { Edit2, Trash2, Calendar, Cake } from 'lucide-react';
import type { Birthday } from '../types';

interface ListViewProps {
  birthdays: Birthday[];
  onEditBirthday: (bday: Birthday) => void;
  onDeleteBirthday: (id: number) => void;
}

export function ListView({ birthdays, onEditBirthday, onDeleteBirthday }: ListViewProps) {
  // Mostrar como DD/MM
  const formatDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
    if (parts.length === 2) return `${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  return (
    <div className="list-view card" style={{ flex: 1 }}>
      <div className="list-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Calendar size={24} color="var(--primary)" /> 
          Lista de Amigos
        </h2>
        <span style={{color: 'var(--primary)', fontWeight: 600, background: 'rgba(139, 92, 246, 0.2)', padding: '0.2rem 0.8rem', borderRadius: '1rem'}}>
          {birthdays.length} Registros
        </span>
      </div>
      
      {birthdays.length === 0 ? (
        <div className="loading">
          <Cake size={48} color="rgba(255,255,255,0.1)" />
          <p>No hay cumpleaños registrados aún.</p>
        </div>
      ) : (
        <ul className="birthday-list">
          {birthdays.map(bday => (
            <li key={bday.id} className="birthday-item">
              <div className="bday-info">
                {bday.image_url ? (
                  <img src={bday.image_url} alt={bday.name} className="bday-avatar" />
                ) : (
                  <div className="bday-avatar">{bday.name.charAt(0).toUpperCase()}</div>
                )}
                <div className="bday-details">
                  <h3>{bday.nickname ? `${bday.name} (${bday.nickname})` : bday.name}</h3>
                  <p><Calendar size={14} /> {formatDate(bday.birth_date)}</p>
                  {bday.custom_message && (
                    <p className="msg-preview">"{bday.custom_message.substring(0, 40)}{bday.custom_message.length > 40 ? '...' : ''}"</p>
                  )}
                </div>
              </div>
              <div className="bday-actions">
                <button onClick={() => onEditBirthday(bday)} className="btn-icon" title="Editar">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => onDeleteBirthday(bday.id)} className="btn-icon danger" title="Eliminar">
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

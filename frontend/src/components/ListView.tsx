import { useState, useMemo } from 'react';
import { Edit2, Trash2, Calendar, Cake, Search } from 'lucide-react';
import type { Birthday } from '../types';

interface ListViewProps {
  birthdays: Birthday[];
  onEditBirthday: (bday: Birthday) => void;
  onDeleteBirthday: (id: number) => void;
}

export function ListView({ birthdays, onEditBirthday, onDeleteBirthday }: ListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);

  // Mostrar como DD/MM
  const formatDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
    if (parts.length === 2) return `${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const filteredBirthdays = useMemo(() => {
    if (!searchTerm) return birthdays;
    const lower = searchTerm.toLowerCase();
    return birthdays.filter(b => 
      b.name.toLowerCase().includes(lower) || 
      (b.nickname && b.nickname.toLowerCase().includes(lower))
    );
  }, [birthdays, searchTerm]);

  const visibleBirthdays = filteredBirthdays.slice(0, visibleCount);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 50;
    if (bottom && visibleCount < filteredBirthdays.length) {
      setVisibleCount(prev => prev + 10);
    }
  };

  return (
    <div className="list-view card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="list-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Calendar size={24} color="var(--primary)" /> 
          Lista de Amigos
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '400px' }}>
          <div className="search-box" style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Buscar por nombre o apodo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <span style={{color: 'var(--primary)', fontWeight: 600, background: 'rgba(139, 92, 246, 0.2)', padding: '0.3rem 0.8rem', borderRadius: '1rem', whiteSpace: 'nowrap'}}>
            {filteredBirthdays.length} Registros
          </span>
        </div>
      </div>
      
      {filteredBirthdays.length === 0 ? (
        <div className="loading" style={{ flex: 1 }}>
          <Cake size={48} color="rgba(255,255,255,0.1)" />
          <p>No hay cumpleaños que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }} onScroll={handleScroll}>
          <ul className="birthday-list">
            {visibleBirthdays.map(bday => (
              <li key={bday.id} className="birthday-item">
                <div className="bday-info">
                  {bday.image_url ? (
                    <img src={bday.image_url} alt={bday.name} className="bday-avatar" />
                  ) : (
                    <div className="bday-avatar">{bday.name.charAt(0).toUpperCase()}</div>
                  )}
                  <div className="bday-details">
                    <h3>
                      {bday.nickname ? `${bday.name} (${bday.nickname})` : bday.name}
                      {bday.birth_year ? ` • ${new Date().getFullYear() - bday.birth_year} años` : ''}
                    </h3>
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
          {visibleCount < filteredBirthdays.length && (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>Cargando más...</div>
          )}
        </div>
      )}
    </div>
  );
}

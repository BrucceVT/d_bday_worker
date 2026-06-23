import { useState, useEffect } from 'react';
import { Cake, Calendar, Image as ImageIcon, MessageSquare, Trash2, Edit2, LogOut, Plus, X, Lock, List, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8787';

interface Birthday {
  id: number;
  name: string;
  nickname?: string | null;
  birth_date: string;
  image_url: string | null;
  custom_message: string | null;
}

function App() {
  const [password, setPassword] = useState<string>(() => localStorage.getItem('bday_pwd') || '');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(false);
  
  // View State
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Create Form State
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editNickname, setEditNickname] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editCustomMessage, setEditCustomMessage] = useState('');

  const fetchBirthdays = async (pwd: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/birthdays`, {
        headers: {
          'Authorization': pwd
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBirthdays(data);
        setIsAuthenticated(true);
        localStorage.setItem('bday_pwd', pwd);
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('bday_pwd');
        if (pwd) alert('Contraseña incorrecta');
      }
    } catch (err) {
      console.error('Error fetching birthdays:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (password) {
      fetchBirthdays(password);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthDate) return;

    // Extraer MM-DD del input type="date"
    const formattedDate = birthDate.substring(5); // "YYYY-MM-DD" -> "MM-DD"

    try {
      const res = await fetch(`${API_URL}/api/birthdays`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': password
        },
        body: JSON.stringify({
          name,
          nickname: nickname || null,
          birth_date: formattedDate,
          image_url: imageUrl || null,
          custom_message: customMessage || null
        })
      });

      if (res.ok) {
        setName('');
        setNickname('');
        setBirthDate('');
        setImageUrl('');
        setCustomMessage('');
        fetchBirthdays(password);
      }
    } catch (err) {
      console.error('Error creating birthday:', err);
    }
  };

  const handleEdit = (bday: Birthday) => {
    setEditingId(bday.id);
    setEditName(bday.name);
    setEditNickname(bday.nickname || '');
    // Necesitamos añadir un año dummy para que el input type="date" lo lea
    setEditBirthDate(`2000-${bday.birth_date}`);
    setEditImageUrl(bday.image_url || '');
    setEditCustomMessage(bday.custom_message || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName || !editBirthDate || editingId === null) return;

    const formattedDate = editBirthDate.substring(5); // "YYYY-MM-DD" -> "MM-DD"

    try {
      const res = await fetch(`${API_URL}/api/birthdays/${editingId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': password
        },
        body: JSON.stringify({
          name: editName,
          nickname: editNickname || null,
          birth_date: formattedDate,
          image_url: editImageUrl || null,
          custom_message: editCustomMessage || null
        })
      });

      if (res.ok) {
        setEditingId(null);
        fetchBirthdays(password);
      }
    } catch (err) {
      console.error('Error updating birthday:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este cumpleaños?')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/birthdays/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': password
        }
      });
      
      if (res.ok) {
        fetchBirthdays(password);
      }
    } catch (err) {
      console.error('Error deleting birthday:', err);
    }
  };

  // Mostrar como DD/MM
  const formatDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
    if (parts.length === 2) return `${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBirthdays(password);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    localStorage.removeItem('bday_pwd');
  };

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

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  if (!isAuthenticated) {
    return (
      <div className="app-container" style={{ maxWidth: '400px', marginTop: '10vh' }}>
        <header className="header">
          <h1>CelebraBot 🎉</h1>
          <p>Acceso Protegido</p>
        </header>
        <div className="card" style={{ textAlign: 'center' }}>
          <Lock size={48} color="var(--primary)" style={{ margin: '0 auto 1.5rem', opacity: 0.8 }} />
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label>Contraseña</label>
              <input 
                type="password" 
                className="form-control" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required
                placeholder="Ingresa la contraseña..."
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Verificando...' : 'Entrar al Sistema'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>CelebraBot 🎉</h1>
        <p>Gestiona los cumpleaños de tus amigos para Discord</p>
        <button onClick={handleLogout} className="btn-icon danger" style={{ position: 'absolute', top: 0, right: 0, width: 'auto', padding: '0 1rem' }} title="Cerrar Sesión">
          <LogOut size={18} /> Salir
        </button>
      </header>

      <main>
        <section className="card">
          <h2><Plus size={24} color="var(--primary)" /> Nuevo Cumpleaños</h2>
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
              <input 
                type="date" 
                className="form-control" 
                value={birthDate} 
                onChange={e => setBirthDate(e.target.value)} 
                required
              />
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

            <button type="submit" className="btn btn-primary"><Cake size={18} /> Guardar Cumpleaños</button>
          </form>
        </section>

        <section className="card">
          <div className="list-header">
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <h2><Calendar size={24} color="var(--primary)" /> Cumpleaños</h2>
              <span style={{color: 'var(--primary)', fontWeight: 600, background: 'rgba(139, 92, 246, 0.2)', padding: '0.2rem 0.8rem', borderRadius: '1rem'}}>
                {birthdays.length}
              </span>
            </div>
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Vista de Lista"
              >
                <List size={18} />
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                onClick={() => setViewMode('calendar')}
                title="Vista de Calendario"
              >
                <CalendarDays size={18} />
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="loading">
              <div style={{animation: 'spin 1s linear infinite'}}><Cake size={32} color="var(--primary)"/></div>
              Cargando datos...
            </div>
          ) : viewMode === 'list' ? (
            birthdays.length === 0 ? (
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
                      <button onClick={() => handleEdit(bday)} className="btn-icon" title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(bday.id)} className="btn-icon danger" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div className="calendar-view">
              <div className="calendar-header">
                <button onClick={prevMonth} className="btn-icon"><ChevronLeft size={20}/></button>
                <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                <button onClick={nextMonth} className="btn-icon"><ChevronRight size={20}/></button>
              </div>
              
              <div className="calendar-grid">
                {daysOfWeek.map(day => (
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
                            <div key={bday.id} className="bday-pill" onClick={() => handleEdit(bday)} title="Editar">
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
          )}
        </section>
      </main>

      {/* Modal de Edición */}
      {editingId !== null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Editar Cumpleaños</h2>
              <button onClick={() => setEditingId(null)} className="modal-close"><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Nombre de la persona</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)} 
                  required
                />
              </div>

              <div className="form-group">
                <label>Apodo / Nickname (Opcional)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editNickname} 
                  onChange={e => setEditNickname(e.target.value)} 
                />
              </div>
              
              <div className="form-group">
                <label>Fecha de Cumpleaños</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={editBirthDate} 
                  onChange={e => setEditBirthDate(e.target.value)} 
                  required
                />
              </div>

              <div className="form-group">
                <label>URL de Imagen (Opcional)</label>
                <input 
                  type="url" 
                  className="form-control" 
                  value={editImageUrl} 
                  onChange={e => setEditImageUrl(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Mensaje Personalizado (Opcional)</label>
                <textarea 
                  className="form-control" 
                  value={editCustomMessage} 
                  onChange={e => setEditCustomMessage(e.target.value)} 
                />
              </div>

              <button type="submit" className="btn btn-primary">Actualizar Cambios</button>
            </form>
          </div>
        </div>
      )}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default App;

import { CalendarDays, List, LogOut, User, Plus } from 'lucide-react';

interface SidebarProps {
  viewMode: 'list' | 'calendar';
  setViewMode: (mode: 'list' | 'calendar') => void;
  onLogout: () => void;
  onAddBirthday: () => void;
}

export function Sidebar({ viewMode, setViewMode, onLogout, onAddBirthday }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>CelebraBot 🎉</h2>
      </div>

      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${viewMode === 'calendar' ? 'active' : ''}`}
          onClick={() => setViewMode('calendar')}
        >
          <CalendarDays size={20} />
          <span>Calendario</span>
        </button>

        <button 
          className={`nav-item ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          <List size={20} />
          <span>Lista de Amigos</span>
        </button>
        
        <button 
          className="nav-item btn-add mt-4" 
          onClick={onAddBirthday}
        >
          <Plus size={20} />
          <span>Nuevo Cumpleaños</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar"><User size={20} /></div>
          <div className="user-info">
            <span className="user-name">Admin</span>
            <span className="user-role">Sesión Activa</span>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout} title="Cerrar Sesión">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}

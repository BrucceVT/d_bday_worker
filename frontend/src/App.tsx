import { useState, useEffect } from 'react';
import type { Birthday, EventRecord } from './types';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { CalendarView } from './components/CalendarView';
import { ListView } from './components/ListView';
import { BirthdayModal } from './components/BirthdayModal';
import { EventsView } from './components/EventsView';
import { EventModal } from './components/EventModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8787';

function App() {
  const [password, setPassword] = useState<string>(() => localStorage.getItem('bday_pwd') || '');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(false);
  
  // View State
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'events'>('calendar');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBirthday, setEditingBirthday] = useState<Birthday | undefined>(undefined);
  
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);

  const fetchData = async (pwd: string) => {
    setLoading(true);
    try {
      const [resBdays, resEvents] = await Promise.all([
        fetch(`${API_URL}/api/birthdays`, { headers: { 'Authorization': pwd } }),
        fetch(`${API_URL}/api/schedule`, { headers: { 'Authorization': pwd } })
      ]);
      
      if (resBdays.ok && resEvents.ok) {
        const dataBdays = await resBdays.json();
        const dataEvents = await resEvents.json();
        setBirthdays(dataBdays);
        setEvents(dataEvents);
        setIsAuthenticated(true);
        localStorage.setItem('bday_pwd', pwd);
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('bday_pwd');
        if (pwd) alert('Contraseña incorrecta');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (password) {
      fetchData(password);
    }
  }, []);

  const handleLogin = (pwd: string) => {
    setPassword(pwd);
    fetchData(pwd);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    localStorage.removeItem('bday_pwd');
  };

  const openAddModal = () => {
    setEditingBirthday(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (bday: Birthday) => {
    setEditingBirthday(bday);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBirthday(undefined);
  };

  const openAddEventModal = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const openEditEventModal = (ev?: EventRecord) => {
    if (ev) setEditingEvent(ev);
    else setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const closeEventModal = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleSaveBirthday = async (data: Partial<Birthday>) => {
    try {
      const method = data.id ? 'PUT' : 'POST';
      const url = data.id ? `${API_URL}/api/birthdays/${data.id}` : `${API_URL}/api/birthdays`;
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': password
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        closeModal();
        fetchData(password);
      }
    } catch (err) {
      console.error('Error saving birthday:', err);
    }
  };

  const handleDeleteBirthday = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este cumpleaños?')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/birthdays/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': password
        }
      });
      
      if (res.ok) {
        fetchData(password);
      }
    } catch (err) {
      console.error('Error deleting birthday:', err);
    }
  };

  const handleSaveEvent = async (data: Omit<EventRecord, 'id'> | EventRecord) => {
    try {
      const isEdit = 'id' in data && data.id !== undefined;
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `${API_URL}/api/schedule/${(data as EventRecord).id}` : `${API_URL}/api/schedule`;
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': password
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        closeEventModal();
        fetchData(password);
      }
    } catch (err) {
      console.error('Error saving event:', err);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este evento?')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/schedule/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': password
        }
      });
      
      if (res.ok) {
        fetchData(password);
      }
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} loading={loading} />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        onLogout={handleLogout} 
        onAddBirthday={openAddModal} 
      />

      <main className="main-content">
        {viewMode === 'calendar' ? (
          <CalendarView 
            birthdays={birthdays} 
            events={events}
            onEditBirthday={openEditModal} 
            onEditEvent={openEditEventModal}
          />
        ) : viewMode === 'list' ? (
          <ListView 
            birthdays={birthdays} 
            onEditBirthday={openEditModal} 
            onDeleteBirthday={handleDeleteBirthday} 
          />
        ) : (
          <EventsView
            events={events}
            onAddEvent={openAddEventModal}
            onEditEvent={openEditEventModal}
            onDeleteEvent={handleDeleteEvent}
          />
        )}
      </main>

      {isModalOpen && (
        <BirthdayModal 
          birthday={editingBirthday} 
          onClose={closeModal} 
          onSave={handleSaveBirthday} 
        />
      )}

      {isEventModalOpen && (
        <EventModal
          event={editingEvent}
          onClose={closeEventModal}
          onSave={handleSaveEvent}
          isLoading={loading}
        />
      )}
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default App;
